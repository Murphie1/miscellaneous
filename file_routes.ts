// src/routes/file.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createFileSchema,
  updateFileSchema,
  getFileSchema,
  getManyFilesSchema,
  deleteFileSchema,
} from '../schemas/file.schema';

export async function fileRoutes(server: FastifyInstance) {
  // Create File
  server.post('/', { schema: createFileSchema }, async (request, reply) => {
    const data = request.body as any;
    const file = await server.prisma.file.create({
      data,
      include: {
        item: true,
        base: true,
        table: true,
      },
    });
    return reply.status(201).send(file);
  });

  // Get File by ID
  server.get('/:id', { schema: getFileSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const { include } = request.query as any;
    
    const includeOptions: any = {};
    if (include?.includes('item')) includeOptions.item = true;
    if (include?.includes('base')) includeOptions.base = true;
    if (include?.includes('table')) includeOptions.table = true;
    
    const file = await server.prisma.file.findUnique({
      where: { id },
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    });
    
    if (!file) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'File not found',
      });
    }
    
    return reply.send(file);
  });

  // Get Many Files
  server.get('/', { schema: getManyFilesSchema }, async (request, reply) => {
    const { skip, take, itemId, baseId, tableId, type } = request.query as any;
    
    const where: any = {};
    if (itemId) where.itemId = itemId;
    if (baseId) where.baseId = baseId;
    if (tableId) where.tableId = tableId;
    if (type) where.type = type;

    const [files, total] = await Promise.all([
      server.prisma.file.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
      }),
      server.prisma.file.count({ where }),
    ]);

    return reply.send({ data: files, total, skip: skip || 0, take: take || 50 });
  });

  // Update File
  server.patch('/:id', { schema: updateFileSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const file = await server.prisma.file.update({
      where: { id },
      data,
    });
    
    return reply.send(file);
  });

  // Delete File
  server.delete('/:id', { schema: deleteFileSchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.file.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
