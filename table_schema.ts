// src/schemas/table.schema.ts
export const createTableSchema = {
  body: {
    type: 'object',
    required: ['name', 'creatorId'],
    properties: {
      name: { type: 'string' },
      imageUrl: { type: 'string', nullable: true },
      provider: { type: 'string', nullable: true },
      baseId: { type: 'string', nullable: true },
      creator: { type: 'string', default: 'user' },
      creatorId: { type: 'string' },
      userIds: { type: 'array', items: { type: 'string' }, default: [] },
      description: { type: 'string', nullable: true },
      notes: { type: 'string', nullable: true },
      roomId: { type: 'string', nullable: true },
      groupId: { type: 'string', nullable: true },
      spaceId: { type: 'string', nullable: true },
      isReadOnly: { type: 'boolean', default: false },
      isPublic: { type: 'boolean', default: false },
      urls: { type: 'array', items: { type: 'string' }, default: [] },
      relations: { type: 'array', items: { type: 'string' }, default: [] },
      parameters: { type: 'array', items: { type: 'string' }, default: [] },
    },
  },
};

export const getTableSchema = {
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
        items: { type: 'string', enum: ['base', 'items', 'files'] },
      },
    },
  },
};

export const getManyTablesSchema = {
  querystring: {
    type: 'object',
    properties: {
      skip: { type: 'integer', minimum: 0 },
      take: { type: 'integer', minimum: 1, maximum: 100 },
      creatorId: { type: 'string' },
      baseId: { type: 'string' },
      isPublic: { type: 'boolean' },
      spaceId: { type: 'string' },
    },
  },
};

export const updateTableSchema = {
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
      name: { type: 'string' },
      imageUrl: { type: 'string', nullable: true },
      provider: { type: 'string', nullable: true },
      baseId: { type: 'string', nullable: true },
      creator: { type: 'string' },
      userIds: { type: 'array', items: { type: 'string' } },
      description: { type: 'string', nullable: true },
      notes: { type: 'string', nullable: true },
      roomId: { type: 'string', nullable: true },
      groupId: { type: 'string', nullable: true },
      spaceId: { type: 'string', nullable: true },
      isReadOnly: { type: 'boolean' },
      isPublic: { type: 'boolean' },
      urls: { type: 'array', items: { type: 'string' } },
      relations: { type: 'array', items: { type: 'string' } },
      parameters: { type: 'array', items: { type: 'string' } },
    },
  },
};

export const deleteTableSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};
