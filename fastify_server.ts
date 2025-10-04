// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { reportRoutes } from './routes/report.routes';
import { memoryRoutes } from './routes/memory.routes';
import { collectionRoutes } from './routes/collection.routes';
import { baseRoutes } from './routes/base.routes';
import { tableRoutes } from './routes/table.routes';
import { itemRoutes } from './routes/item.routes';
import { fileRoutes } from './routes/file.routes';
import { messageRoutes } from './routes/message.routes';
import { errorHandler } from './utils/errorHandler';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
  },
});

// Decorators
server.decorate('prisma', prisma);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Plugins
async function startServer() {
  try {
    // Security plugins
    await server.register(helmet, {
      contentSecurityPolicy: false,
    });

    await server.register(cors, {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });

    await server.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    // Health check
    server.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Routes
    await server.register(reportRoutes, { prefix: '/api/reports' });
    await server.register(memoryRoutes, { prefix: '/api/memories' });
    await server.register(collectionRoutes, { prefix: '/api/collections' });
    await server.register(baseRoutes, { prefix: '/api/bases' });
    await server.register(tableRoutes, { prefix: '/api/tables' });
    await server.register(itemRoutes, { prefix: '/api/items' });
    await server.register(fileRoutes, { prefix: '/api/files' });
    await server.register(messageRoutes, { prefix: '/api/messages' });

    // Error handler
    server.setErrorHandler(errorHandler);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        await server.close();
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

startServer();
