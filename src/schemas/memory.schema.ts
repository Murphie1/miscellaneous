// src/schemas/memory.schema.ts
export const createMemorySchema = {
  body: {
    type: 'object',
    required: ['content', 'agent'],
    properties: {
      title: { type: 'string', nullable: true },
      content: { type: 'string' },
      agent: { type: 'string' },
      type: { type: 'string', default: 'feedback' },
    },
  },
};

export const getMemorySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};

export const getManyMemoriesSchema = {
  querystring: {
    type: 'object',
    properties: {
      skip: { type: 'integer', minimum: 0 },
      take: { type: 'integer', minimum: 1, maximum: 100 },
      agent: { type: 'string' },
      type: { type: 'string' },
    },
  },
};

export const updateMemorySchema = {
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
      title: { type: 'string', nullable: true },
      content: { type: 'string' },
      agent: { type: 'string' },
      type: { type: 'string' },
    },
  },
};

export const deleteMemorySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};
