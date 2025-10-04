// src/routes/memory.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createMemorySchema,
  updateMemorySchema,
  getMemorySchema,
  getManyMemoriesSchema,
  deleteMemorySchema,
} from '../schemas/memory.schema';

export async function memoryRoutes(server: FastifyInstance) {
  // Create Memory
  server.post('/', { schema: createMemorySchema }, async (request, reply) => {
    const data = request.body as any;
    const memory = await server.prisma.memory.create({ data });
    return reply.status(201).send(memory);
  });

  // Get Memory by ID
  server.get('/:id', { schema: getMemorySchema }, async (request, reply) => {
    const { id } = request.params as any;
    const memory = await server.prisma.memory.findUnique({ where: { id } });
    
    if (!memory) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Memory not found',
      });
    }
    
    return reply.send(memory);
  });

  // Get Many Memories
  server.get('/', { schema: getManyMemoriesSchema }, async (request, reply) => {
    const { skip, take, agent, type } = request.query as any;
    
    const where: any = {};
    if (agent) where.agent = agent;
    if (type) where.type = type;

    const [memories, total] = await Promise.all([
      server.prisma.memory.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      server.prisma.memory.count({ where }),
    ]);

    return reply.send({ data: memories, total, skip: skip || 0, take: take || 50 });
  });

  // Update Memory
  server.patch('/:id', { schema: updateMemorySchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const memory = await server.prisma.memory.update({
      where: { id },
      data,
    });
    
    return reply.send(memory);
  });

  // Delete Memory
  server.delete('/:id', { schema: deleteMemorySchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.memory.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
