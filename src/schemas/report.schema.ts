// src/schemas/report.schema.ts
export const createReportSchema = {
  body: {
    type: 'object',
    required: ['agent', 'message'],
    properties: {
      agent: { type: 'string' },
      taskId: { type: 'string', nullable: true },
      message: { type: 'string' },
      type: { type: 'string', default: 'feedback' },
      priority: { type: 'boolean', default: false },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        agent: { type: 'string' },
        taskId: { type: 'string', nullable: true },
        message: { type: 'string' },
        type: { type: 'string' },
        priority: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const getReportSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};

export const getManyReportsSchema = {
  querystring: {
    type: 'object',
    properties: {
      skip: { type: 'integer', minimum: 0 },
      take: { type: 'integer', minimum: 1, maximum: 100 },
      agent: { type: 'string' },
      type: { type: 'string' },
      priority: { type: 'boolean' },
    },
  },
};

export const updateReportSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      agent: { type: 'string' },
      taskId: { type: 'string', nullable: true },
      message: { type: 'string' },
      type: { type: 'string' },
      priority: { type: 'boolean' },
    },
  },
};

export const deleteReportSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};
