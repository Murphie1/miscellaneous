// src/routes/message.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createMessageSchema,
  updateMessageSchema,
  getMessageSchema,
  getManyMessagesSchema,
  deleteMessageSchema,
} from '../schemas/message.schema';

export async function messageRoutes(server: FastifyInstance) {
  // Create Message
  server.post('/', { schema: createMessageSchema }, async (request, reply) => {
    const data = request.body as any;
    const message = await server.prisma.message.create({ data });
    return reply.status(201).send(message);
  });

  // Get Message by ID
  server.get('/:id', { schema: getMessageSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const message = await server.prisma.message.findUnique({ where: { id } });
    
    if (!message) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Message not found',
      });
    }
    
    return reply.send(message);
  });

  // Get Many Messages
  server.get('/', { schema: getManyMessagesSchema }, async (request, reply) => {
    const { skip, take, userId, agentId, loading, deleted, type, stopReason } = request.query as any;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (agentId) where.agentId = agentId;
    if (loading !== undefined) where.loading = loading;
    if (deleted !== undefined) where.deleted = deleted;
    if (type) where.type = type;
    if (stopReason) where.stopReason = stopReason;

    const [messages, total] = await Promise.all([
      server.prisma.message.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      server.prisma.message.count({ where }),
    ]);

    return reply.send({ data: messages, total, skip: skip || 0, take: take || 50 });
  });

  // Update Message
  server.patch('/:id', { schema: updateMessageSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const message = await server.prisma.message.update({
      where: { id },
      data,
    });
    
    return reply.send(message);
  });

  // Delete Message
  server.delete('/:id', { schema: deleteMessageSchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.message.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
