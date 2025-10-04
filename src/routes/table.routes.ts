// src/routes/table.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createTableSchema,
  updateTableSchema,
  getTableSchema,
  getManyTablesSchema,
  deleteTableSchema,
} from '../schemas/table.schema';

export async function tableRoutes(server: FastifyInstance) {
  // Create Table
  server.post('/', { schema: createTableSchema }, async (request, reply) => {
    const data = request.body as any;
    const table = await server.prisma.table.create({
      data,
      include: {
        base: true,
        items: true,
        files: true,
      },
    });
    return reply.status(201).send(table);
  });

  // Get Table by ID
  server.get('/:id', { schema: getTableSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const { include } = request.query as any;
    
    const includeOptions: any = {};
    if (include?.includes('base')) includeOptions.base = true;
    if (include?.includes('items')) includeOptions.items = true;
    if (include?.includes('files')) includeOptions.files = true;
    
    const table = await server.prisma.table.findUnique({
      where: { id },
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    });
    
    if (!table) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Table not found',
      });
    }
    
    return reply.send(table);
  });

  // Get Many Tables
  server.get('/', { schema: getManyTablesSchema }, async (request, reply) => {
    const { skip, take, creatorId, baseId, isPublic, spaceId } = request.query as any;
    
    const where: any = {};
    if (creatorId) where.creatorId = creatorId;
    if (baseId) where.baseId = baseId;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (spaceId) where.spaceId = spaceId;

    const [tables, total] = await Promise.all([
      server.prisma.table.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      server.prisma.table.count({ where }),
    ]);

    return reply.send({ data: tables, total, skip: skip || 0, take: take || 50 });
  });

  // Update Table
  server.patch('/:id', { schema: updateTableSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const table = await server.prisma.table.update({
      where: { id },
      data,
    });
    
    return reply.send(table);
  });

  // Delete Table
  server.delete('/:id', { schema: deleteTableSchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.table.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
