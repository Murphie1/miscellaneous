// src/schemas/file.schema.ts
export const createFileSchema = {
  body: {
    type: 'object',
    required: ['url', 'name', 'type', 'extension'],
    properties: {
      url: { type: 'string' },
      name: { type: 'string' },
      itemId: { type: 'string', nullable: true },
      baseId: { type: 'string', nullable: true },
      tableId: { type: 'string', nullable: true },
      type: { type: 'string' },
      extension: { type: 'string' },
    },
  },
};

export const getFileSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      include: {
        type: 'array',
        items: { type: 'string', enum: ['item', 'base', 'table'] },
      },
    },
  },
};

export const getManyFilesSchema = {
  querystring: {
    type: 'object',
    properties: {
      skip: { type: 'integer', minimum: 0 },
      take: { type: 'integer', minimum: 1, maximum: 100 },
      itemId: { type: 'string' },
      baseId: { type: 'string' },
      tableId: { type: 'string' },
      type: { type: 'string' },
    },
  },
};

export const updateFileSchema = {
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
      url: { type: 'string' },
      name: { type: 'string' },
      itemId: { type: 'string', nullable: true },
      baseId: { type: 'string', nullable: true },
      tableId: { type: 'string', nullable: true },
      type: { type: 'string' },
      extension: { type: 'string' },
    },
  },
};

export const deleteFileSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};
