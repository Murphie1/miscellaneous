// src/schemas/collection.schema.ts
export const createCollectionSchema = {
  body: {
    type: 'object',
    required: ['name', 'creatorId'],
    properties: {
      name: { type: 'string' },
      image: { type: 'string', nullable: true },
      creatorId: { type: 'string' },
      collectionId: { type: 'string', nullable: true },
      byTutor: { type: 'boolean', default: false },
      roomId: { type: 'string', nullable: true },
      genId: { type: 'string', nullable: true },
      spaceId: { type: 'string', nullable: true },
      isReadOnly: { type: 'boolean', default: false },
      isPublic: { type: 'boolean', default: false },
      sharedUserIds: { type: 'array', items: { type: 'string' }, default: [] },
    },
  },
};

export const getCollectionSchema = {
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
        items: { type: 'string', enum: ['parent', 'kids', 'bases'] },
      },
    },
  },
};

export const getManyCollectionsSchema = {
  querystring: {
    type: 'object',
    properties: {
      skip: { type: 'integer', minimum: 0 },
      take: { type: 'integer', minimum: 1, maximum: 100 },
      creatorId: { type: 'string' },
      byTutor: { type: 'boolean' },
      isPublic: { type: 'boolean' },
      spaceId: { type: 'string' },
    },
  },
};

export const updateCollectionSchema = {
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
      image: { type: 'string', nullable: true },
      collectionId: { type: 'string', nullable: true },
      byTutor: { type: 'boolean' },
      roomId: { type: 'string', nullable: true },
      genId: { type: 'string', nullable: true },
      spaceId: { type: 'string', nullable: true },
      isReadOnly: { type: 'boolean' },
      isPublic: { type: 'boolean' },
      sharedUserIds: { type: 'array', items: { type: 'string' } },
    },
  },
};

export const deleteCollectionSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};
