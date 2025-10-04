// src/routes/collection.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createCollectionSchema,
  updateCollectionSchema,
  getCollectionSchema,
  getManyCollectionsSchema,
  deleteCollectionSchema,
} from '../schemas/collection.schema';

export async function collectionRoutes(server: FastifyInstance) {
  // Create Collection
  server.post('/', { schema: createCollectionSchema }, async (request, reply) => {
    const data = request.body as any;
    const collection = await server.prisma.collection.create({
      data,
      include: {
        parent: true,
        kids: true,
        bases: true,
      },
    });
    return reply.status(201).send(collection);
  });

  // Get Collection by ID
  server.get('/:id', { schema: getCollectionSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const { include } = request.query as any;
    
    const includeOptions: any = {};
    if (include?.includes('parent')) includeOptions.parent = true;
    if (include?.includes('kids')) includeOptions.kids = true;
    if (include?.includes('bases')) includeOptions.bases = true;
    
    const collection = await server.prisma.collection.findUnique({
      where: { id },
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    });
    
    if (!collection) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Collection not found',
      });
    }
    
    return reply.send(collection);
  });

  // Get Many Collections
  server.get('/', { schema: getManyCollectionsSchema }, async (request, reply) => {
    const { skip, take, creatorId, byTutor, isPublic, spaceId } = request.query as any;
    
    const where: any = {};
    if (creatorId) where.creatorId = creatorId;
    if (byTutor !== undefined) where.byTutor = byTutor;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (spaceId) where.spaceId = spaceId;

    const [collections, total] = await Promise.all([
      server.prisma.collection.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      server.prisma.collection.count({ where }),
    ]);

    return reply.send({ data: collections, total, skip: skip || 0, take: take || 50 });
  });

  // Update Collection
  server.patch('/:id', { schema: updateCollectionSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const collection = await server.prisma.collection.update({
      where: { id },
      data,
    });
    
    return reply.send(collection);
  });

  // Delete Collection
  server.delete('/:id', { schema: deleteCollectionSchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.collection.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
