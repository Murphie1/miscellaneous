# Fastify Backend API

A production-ready RESTful API built with Fastify, TypeScript, and Prisma, providing full CRUD operations for all database models.

## Features

- ✅ **Full CRUD Operations** for all models (Create, Read, Update, Delete)
- ✅ **TypeScript** for type safety
- ✅ **Prisma ORM** for database management
- ✅ **Request Validation** with JSON Schema
- ✅ **Error Handling** with custom error handler
- ✅ **Rate Limiting** to prevent abuse
- ✅ **CORS** support
- ✅ **Security Headers** with Helmet
- ✅ **Logging** with Pino
- ✅ **Pagination** support
- ✅ **Filtering** by various fields
- ✅ **Relations** support with includes

## Project Structure

```
.
├── src/
│   ├── routes/           # API route handlers
│   │   ├── report.routes.ts
│   │   ├── memory.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── base.routes.ts
│   │   ├── table.routes.ts
│   │   ├── item.routes.ts
│   │   ├── file.routes.ts
│   │   └── message.routes.ts
│   ├── schemas/          # Request/Response validation schemas
│   │   ├── report.schema.ts
│   │   ├── memory.schema.ts
│   │   ├── collection.schema.ts
│   │   ├── base.schema.ts
│   │   ├── table.schema.ts
│   │   ├── item.schema.ts
│   │   ├── file.schema.ts
│   │   └── message.schema.ts
│   ├── utils/            # Utility functions
│   │   └── errorHandler.ts
│   └── server.ts         # Main server file
├── prisma/
│   └── schema.prisma     # Prisma schema
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

## Usage

### Development
```bash
npm run dev
```
Server will start on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### View Database
```bash
npm run prisma:studio
```

## API Endpoints

All endpoints follow RESTful conventions and return JSON responses.

### Reports
- `POST /api/reports` - Create a new report
- `GET /api/reports/:id` - Get report by ID
- `GET /api/reports` - Get all reports (with pagination & filters)
- `PATCH /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Memories
- `POST /api/memories` - Create a new memory
- `GET /api/memories/:id` - Get memory by ID
- `GET /api/memories` - Get all memories (with pagination & filters)
- `PATCH /api/memories/:id` - Update memory
- `DELETE /api/memories/:id` - Delete memory

### Collections
- `POST /api/collections` - Create a new collection
- `GET /api/collections/:id` - Get collection by ID (supports `?include=parent,kids,bases`)
- `GET /api/collections` - Get all collections (with pagination & filters)
- `PATCH /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection

### Bases
- `POST /api/bases` - Create a new base
- `GET /api/bases/:id` - Get base by ID (supports `?include=collection,tables,files`)
- `GET /api/bases` - Get all bases (with pagination & filters)
- `PATCH /api/bases/:id` - Update base
- `DELETE /api/bases/:id` - Delete base

### Tables
- `POST /api/tables` - Create a new table
- `GET /api/tables/:id` - Get table by ID (supports `?include=base,items,files`)
- `GET /api/tables` - Get all tables (with pagination & filters)
- `PATCH /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### Items
- `POST /api/items` - Create a new item
- `GET /api/items/:id` - Get item by ID (supports `?include=table,files`)
- `GET /api/items` - Get all items (with pagination & filters)
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Files
- `POST /api/files` - Create a new file
- `GET /api/files/:id` - Get file by ID (supports `?include=item,base,table`)
- `GET /api/files` - Get all files (with pagination & filters)
- `PATCH /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

### Messages
- `POST /api/messages` - Create a new message
- `GET /api/messages/:id` - Get message by ID
- `GET /api/messages` - Get all messages (with pagination & filters)
- `PATCH /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

### Health Check
- `GET /health` - Check server status

## Query Parameters

### Pagination
All `GET` list endpoints support pagination:
- `skip` - Number of records to skip (default: 0)
- `take` - Number of records to return (default: 50, max: 100)

Example: `/api/reports?skip=10&take=20`

### Filtering
Most endpoints support filtering by specific fields. Check the schema files for available filters.

Examples:
- `/api/reports?agent=myAgent&type=feedback`
- `/api/collections?creatorId=user123&isPublic=true`
- `/api/messages?userId=user456&loading=false`

### Including Relations
Use the `include` query parameter to load related data:
- `/api/collections/123?include=parent&include=bases`
- `/api/bases/456?include=collection&include=tables&include=files`

## Request Examples

### Create a Report
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "my-agent",
    "message": "This is a test report",
    "type": "feedback",
    "priority": false
  }'
```

### Get Reports with Pagination
```bash
curl "http://localhost:3000/api/reports?skip=0&take=10&agent=my-agent"
```

### Update a Report
```bash
curl -X PATCH http://localhost:3000/api/reports/abc-123 \
  -H "Content-Type: application/json" \
  -d '{
    "priority": true,
    "message": "Updated message"
  }'
```

### Delete a Report
```bash
curl -X DELETE http://localhost:3000/api/reports/abc-123
```

### Create a Collection with Relations
```bash
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Collection",
    "creatorId": "user123",
    "isPublic": true,
    "sharedUserIds": ["user456", "user789"]
  }'
```

## Response Format

### Success Response (Single Item)
```json
{
  "id": "abc-123",
  "agent": "my-agent",
  "message": "Test message",
  "type": "feedback",
  "priority": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Success Response (List)
```json
{
  "data": [...],
  "total": 100,
  "skip": 0,
  "take": 50
}
```

### Error Response
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Report not found"
}
```

## Error Handling

The API handles various error types:
- **400 Bad Request** - Invalid input or validation error
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate unique field
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

## Security

- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Configurable via `CORS_ORIGIN` environment variable
- **Helmet**: Security headers enabled
- **Input Validation**: All requests validated with JSON Schema
- **SQL Injection**: Protected by Prisma's parameterized queries

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment (development/production) | development |
| `CORS_ORIGIN` | Allowed CORS origins | * |
| `LOG_LEVEL` | Logging level | info |

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Technologies

- **Fastify** - Fast and low overhead web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Modern ORM for TypeScript
- **PostgreSQL** - Relational database
- **Pino** - Fast JSON logger

## License

MIT
