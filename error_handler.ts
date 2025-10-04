// src/utils/errorHandler.ts
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'A record with this unique field already exists',
        });
      case 'P2025':
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Record not found',
        });
      case 'P2003':
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Foreign key constraint failed',
        });
      default:
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.message,
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid data provided',
    });
  }

  // Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
      validation: error.validation,
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
  });
}
