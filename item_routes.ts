// src/routes/item.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createItemSchema,
  updateItemSchema,
  getItemSchema,
  getManyItemsSchema,
  deleteItemSchema,
} from '../schemas/item.schema';

export async function itemRoutes(server: FastifyInstance) {
  // Create Item
  server.post('/', { schema: createItemSchema }, async (request, reply) => {
    const data = request.body as any;
    const item = await server.prisma.item.create({
      data,
      include: {
        table: true,
        files: true,
      },
    });
    return reply.status(201).send(item);
  });

  // Get Item by ID
  server.get('/:id', { schema: getItemSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const { include } = request.query as any;
    
    const includeOptions: any = {};
    if (include?.includes('table')) includeOptions.table = true;
    if (include?.includes('files')) includeOptions.files = true;
    
    const item = await server.prisma.item.findUnique({
      where: { id },
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    });
    
    if (!item) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Item not found',
      });
    }
    
    return reply.send(item);
  });

  // Get Many Items
  server.get('/', { schema: getManyItemsSchema }, async (request, reply) => {
    const { skip, take, tableId, type } = request.query as any;
    
    const where: any = {};
    if (tableId) where.tableId = tableId;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      server.prisma.item.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
      }),
      server.prisma.item.count({ where }),
    ]);

    return reply.send({ data: items, total, skip: skip || 0, take: take || 50 });
  });

  // Update Item
  server.patch('/:id', { schema: updateItemSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const item = await server.prisma.item.update({
      where: { id },
      data,
    });
    
    return reply.send(item);
  });

  // Delete Item
  server.delete('/:id', { schema: deleteItemSchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.item.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
