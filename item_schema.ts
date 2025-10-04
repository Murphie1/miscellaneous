// src/schemas/item.schema.ts
export const createItemSchema = {
  body: {
    type: 'object',
    required: ['name', 'tableId'],
    properties: {
      url: { type: 'string', nullable: true },
      name: { type: 'string' },
      value: { type: 'string', nullable: true },
      tableId: { type: 'string' },
      type: { type: 'string', default: 'string' },
      parameters: { type: 'array', items: { type: 'string' }, default: [] },
      notes: { type: 'string', nullable: true },
    },
  },
};

export const getItemSchema = {
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
        items: { type: 'string', enum: ['table', 'files'] },
      },
    },
  },
};

export const getManyItemsSchema = {
  querystring: {
    type: 'object',
    properties: {
      skip: { type: 'integer', minimum: 0 },
      take: { type: 'integer', minimum: 1, maximum: 100 },
      tableId: { type: 'string' },
      type: { type: 'string' },
    },
  },
};

export const updateItemSchema = {
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
      url: { type: 'string', nullable: true },
      name: { type: 'string' },
      value: { type: 'string', nullable: true },
      tableId: { type: 'string' },
      type: { type: 'string' },
      parameters: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string', nullable: true },
    },
  },
};

export const deleteItemSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};
