const { LogicalReplicationService, Wal2JsonPlugin } = require('pg-logical-replication');
const WebSocket = require('ws');
const fs = require('fs');
const fse = require('fs-extra');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const REPLICATION_SLOT = process.env.REPLICATION_SLOT || 'miscellaneous';
const PORT = parseInt(process.env.PORT || '4000', 10);
const AUTH_TOKEN = process.env.AUTH_TOKEN || null;
const LSN_FILE = process.env.LSN_FILE || './replication.lsn';

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in environment.');
  process.exit(1);
}

// Persist and read last processed LSN so we can resume where we left off
function readLastLsn() {
  try {
    if (fs.existsSync(LSN_FILE)) {
      const v = fs.readFileSync(LSN_FILE, 'utf8').trim();
      if (v) return v;
    }
  } catch (e) {
    console.warn('Could not read LSN file:', e.message);
  }
  return null;
}

function writeLastLsn(lsn) {
  try {
    fse.outputFileSync(LSN_FILE, String(lsn));
  } catch (e) {
    console.warn('Could not write LSN file:', e.message);
  }
}

// Simple in-memory client registry with per-client table subscriptions
class ClientWrapper {
  constructor(ws) {
    this.ws = ws;
    this.subscribedTables = null; // null = all tables
    this.authed = false;
    this._setup();
  }

  _setup() {
    this.ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch (e) {
        this._send({ type: 'error', error: 'invalid_json' });
        return;
      }

      if (msg.type === 'auth') {
        if (!AUTH_TOKEN) {
          this.authed = true; // no auth required
          this._send({ type: 'info', message: 'no_auth_required' });
          return;
        }
        if (msg.token === AUTH_TOKEN) {
          this.authed = true;
          this._send({ type: 'info', message: 'authenticated' });
        } else {
          this._send({ type: 'error', error: 'invalid_token' });
          this.ws.close();
        }
        return;
      }

      // require auth if AUTH_TOKEN is set
      if (AUTH_TOKEN && !this.authed) {
        this._send({ type: 'error', error: 'not_authenticated' });
        return;
      }

      if (msg.type === 'subscribe') {
        if (!Array.isArray(msg.tables)) {
          this._send({ type: 'error', error: 'tables_must_be_array' });
          return;
        }
        this.subscribedTables = new Set(msg.tables.map(String));
        this._send({ type: 'subscribed', tables: Array.from(this.subscribedTables) });
        return;
      }

      if (msg.type === 'unsubscribe') {
        if (!Array.isArray(msg.tables)) {
          this._send({ type: 'error', error: 'tables_must_be_array' });
          return;
        }
        if (!this.subscribedTables) this.subscribedTables = new Set();
        for (const t of msg.tables) this.subscribedTables.delete(String(t));
        this._send({ type: 'unsubscribed', tables: Array.from(this.subscribedTables) });
        return;
      }

      this._send({ type: 'error', error: 'unknown_message_type' });
    });

    this.ws.on('close', () => {
      // cleanup handled by server side
    });
  }

  matchesTable(table) {
    if (!this.subscribedTables) return true;
    return this.subscribedTables.has(table);
  }

  _send(obj) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }
}

// WebSocket server
const wss = new WebSocket.Server({ port: PORT });
const clients = new Set();

wss.on('connection', (ws, req) => {
  // quick token check via query param
  const url = new URL(req.url, `http://localhost`);
  const token = url.searchParams.get('token');
  const cw = new ClientWrapper(ws);

  if (AUTH_TOKEN) {
    if (token && token === AUTH_TOKEN) {
      cw.authed = true;
      cw._send({ type: 'info', message: 'authenticated_via_query' });
    } else {
      // require explicit auth message if no token or wrong token
      cw._send({ type: 'info', message: 'please_auth' });
    }
  } else {
    cw.authed = true; // public
  }

  clients.add(cw);
  ws.on('close', () => clients.delete(cw));
});

console.log(`WebSocket server listening on ws://0.0.0.0:${PORT}`);

// Replication logic
let replicationService = null;
let shuttingDown = false;
let restarting = false;
let backoff = 1000; // 1s
let maxBackoff = 30_000; // 30s

async function cleanupReplication() {
  if (replicationService) {
    try {
      console.log('Closing replication service...');
      // Check if stop method exists before calling
      if (typeof replicationService.stop === 'function') {
        await replicationService.stop();
      }
      // The service uses 'stop' not 'close' in pg-logical-replication
      // Give it a moment to fully disconnect
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Replication service closed successfully');
    } catch (e) {
      console.warn('Error during cleanup:', e.message);
    }
    replicationService = null;
  }
}

async function startReplication() {
  if (replicationService) {
    console.log('Replication service already exists, cleaning up first...');
    await cleanupReplication();
  }

  const lastLsn = readLastLsn();
  console.log('Resuming from LSN:', lastLsn || 'start-of-slot');

  replicationService = new LogicalReplicationService(
    { connectionString: DATABASE_URL },
    { acknowledge: { auto: true, timeoutSeconds: 10 } }
  );

  const plugin = new Wal2JsonPlugin({ pretty: false });

  replicationService.on('start', () => console.log('Logical replication started'));

  replicationService.on('data', (lsn, log) => {
    try {
      // log is the wal2json decoded object; structure: { change: [ ... ] }
      // Each change has: kind, schema, table, columnnames, columnvalues, oldkeys, etc.
      writeLastLsn(lsn);

      if (!log || !Array.isArray(log.change)) return;

      for (const change of log.change) {
        const table = change.table || (change.schema ? `${change.schema}.${change.table}` : 'unknown');
        const payload = {
          table: change.table || null,
          schema: change.schema || null,
          kind: change.kind, // insert/update/delete
          body: change,
          lsn,
          timestamp: new Date().toISOString(),
        };

        // broadcast to clients who are subscribed to this table (or all)
        for (const c of clients) {
          try {
            if (AUTH_TOKEN && !c.authed) continue; // only authenticated clients
            if (c.matchesTable(payload.table)) c._send({ type: 'change', ...payload });
          } catch (e) {
            console.warn('Failed to send to client:', e.message);
          }
        }
      }
    } catch (e) {
      console.error('Error processing replication data:', e);
    }
  });

  replicationService.on('error', (err) => {
    console.error('Replication error:', err);
    if (!shuttingDown) {
      // attempt restart with backoff
      restartReplicationWithBackoff();
    }
  });

  // subscribe will block and keep streaming. If lastLsn is provided we pass it as the start point
  try {
    await replicationService.subscribe(plugin, REPLICATION_SLOT, { startLsn: lastLsn || undefined });
  } catch (e) {
    console.error('Failed to subscribe replication:', e);
    await cleanupReplication(); // Clean up before restarting
    if (!shuttingDown) {
      restartReplicationWithBackoff();
    }
  }
}

async function restartReplicationWithBackoff() {
  if (restarting || shuttingDown) return;
  restarting = true;
  
  // Clean up first
  await cleanupReplication();
  
  console.log(`Restarting replication in ${backoff}ms`);
  setTimeout(async () => {
    try {
      await startReplication();
      backoff = 1000; // reset on success
      restarting = false;
    } catch (e) {
      console.error('Restart failed:', e);
      backoff = Math.min(maxBackoff, backoff * 2);
      restarting = false; // Reset before recursing
      restartReplicationWithBackoff();
    }
  }, backoff);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('Shutting down...');
  try {
    wss.close();
  } catch (e) {}
  try {
    await cleanupReplication();
  } catch (e) {}
  // close all clients
  for (const c of clients) {
    try { c.ws.close(); } catch (e) {}
  }
  process.exit(0);
}

// Start
startReplication().catch((err) => {
  console.error('Fatal replication start error:', err);
  restartReplicationWithBackoff();
});
