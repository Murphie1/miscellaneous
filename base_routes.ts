// src/routes/base.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createBaseSchema,
  updateBaseSchema,
  getBaseSchema,
  getManyBasesSchema,
  deleteBaseSchema,
} from '../schemas/base.schema';

export async function baseRoutes(server: FastifyInstance) {
  // Create Base
  server.post('/', { schema: createBaseSchema }, async (request, reply) => {
    const data = request.body as any;
    const base = await server.prisma.base.create({
      data,
      include: {
        collection: true,
        tables: true,
        files: true,
      },
    });
    return reply.status(201).send(base);
  });

  // Get Base by ID
  server.get('/:id', { schema: getBaseSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const { include } = request.query as any;
    
    const includeOptions: any = {};
    if (include?.includes('collection')) includeOptions.collection = true;
    if (include?.includes('tables')) includeOptions.tables = true;
    if (include?.includes('files')) includeOptions.files = true;
    
    const base = await server.prisma.base.findUnique({
      where: { id },
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    });
    
    if (!base) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Base not found',
      });
    }
    
    return reply.send(base);
  });

  // Get Many Bases
  server.get('/', { schema: getManyBasesSchema }, async (request, reply) => {
    const { skip, take, creatorId, collectionId, isPublic, spaceId } = request.query as any;
    
    const where: any = {};
    if (creatorId) where.creatorId = creatorId;
    if (collectionId) where.collectionId = collectionId;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (spaceId) where.spaceId = spaceId;

    const [bases, total] = await Promise.all([
      server.prisma.base.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      server.prisma.base.count({ where }),
    ]);

    return reply.send({ data: bases, total, skip: skip || 0, take: take || 50 });
  });

  // Update Base
  server.patch('/:id', { schema: updateBaseSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const base = await server.prisma.base.update({
      where: { id },
      data,
    });
    
    return reply.send(base);
  });

  // Delete Base
  server.delete('/:id', { schema: deleteBaseSchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.base.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
