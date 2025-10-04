// src/routes/report.routes.ts
import { FastifyInstance } from 'fastify';
import {
  createReportSchema,
  updateReportSchema,
  getReportSchema,
  getManyReportsSchema,
  deleteReportSchema,
} from '../schemas/report.schema';

export async function reportRoutes(server: FastifyInstance) {
  // Create Report
  server.post('/', { schema: createReportSchema }, async (request, reply) => {
    const data = request.body as any;
    const report = await server.prisma.report.create({ data });
    return reply.status(201).send(report);
  });

  // Get Report by ID
  server.get('/:id', { schema: getReportSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const report = await server.prisma.report.findUnique({ where: { id } });
    
    if (!report) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Report not found',
      });
    }
    
    return reply.send(report);
  });

  // Get Many Reports
  server.get('/', { schema: getManyReportsSchema }, async (request, reply) => {
    const { skip, take, agent, type, priority } = request.query as any;
    
    const where: any = {};
    if (agent) where.agent = agent;
    if (type) where.type = type;
    if (priority !== undefined) where.priority = priority;

    const [reports, total] = await Promise.all([
      server.prisma.report.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      server.prisma.report.count({ where }),
    ]);

    return reply.send({ data: reports, total, skip: skip || 0, take: take || 50 });
  });

  // Update Report
  server.patch('/:id', { schema: updateReportSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    
    const report = await server.prisma.report.update({
      where: { id },
      data,
    });
    
    return reply.send(report);
  });

  // Delete Report
  server.delete('/:id', { schema: deleteReportSchema }, async (request, reply) => {
    const { id } = request.params as any;
    
    await server.prisma.report.delete({ where: { id } });
    
    return reply.status(204).send();
  });
}
