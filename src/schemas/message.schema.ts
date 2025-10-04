// src/schemas/message.schema.ts
export const createMessageSchema = {
  body: {
    type: 'object',
    required: ['id', 'createdAt', 'userId'],
    properties: {
      id: { type: 'string' },
      input: { type: 'string', nullable: true },
      output: { type: 'string', nullable: true },
      loading: { type: 'boolean', default: true },
      context: { type: 'string', nullable: true },
      url: { type: 'string', nullable: true },
      itype: { type: 'string', default: 'text' },
      type: { type: 'string', default: 'text' },
      stop: { type: 'boolean', default: false },
      deleted: { type: 'boolean', default: false },
      agent: { type: 'object', nullable: true },
      agentId: { type: 'string', nullable: true },
      stopReason: { 
        type: 'string', 
        enum: ['error', 'cancel', 'apikey', 'recursion', 'finish']
      },
      agentPrompt: { type: 'string', nullable: true },
      updatedAt: { type: 'string', nullable: true },
      urls: { type: 'array', items: { type: 'string' } },
      tools: { type: 'array', items: { type: 'object' } },
    },
  },
};

export const deleteMessageSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};stopReason: { 
        type: 'string', 
        enum: ['error', 'cancel', 'apikey', 'recursion', 'finish'],
        default: 'finish'
      },
      agentPrompt: { type: 'string', nullable: true },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string', nullable: true },
      userId: { type: 'string' },
      urls: { type: 'array', items: { type: 'string' }, default: [] },
      tools: { type: 'array', items: { type: 'object' }, default: [] },
    },
  },
};

export const getMessageSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};

export const getManyMessagesSchema = {
  querystring: {
    type: 'object',
    properties: {
      skip: { type: 'integer', minimum: 0 },
      take: { type: 'integer', minimum: 1, maximum: 100 },
      userId: { type: 'string' },
      agentId: { type: 'string' },
      loading: { type: 'boolean' },
      deleted: { type: 'boolean' },
      type: { type: 'string' },
      stopReason: { 
        type: 'string', 
        enum: ['error', 'cancel', 'apikey', 'recursion', 'finish']
      },
    },
  },
};

export const updateMessageSchema = {
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
      input: { type: 'string', nullable: true },
      output: { type: 'string', nullable: true },
      loading: { type: 'boolean' },
      context: { type: 'string', nullable: true },
      url: { type: 'string', nullable: true },
      itype: { type: 'string' },
      type: { type: 'string' },
      stop: { type: 'boolean' },
      deleted: { type: 'boolean' },
      agent: { type: 'object', nullable: true },
      agentId: { type: 'string', nullable: true },
      
