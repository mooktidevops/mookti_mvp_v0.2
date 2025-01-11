import { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  uniqueIndex
} from 'drizzle-orm/pg-core';

export const learningPaths = pgTable('learning_paths', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    slugIndex: uniqueIndex('learning_paths_slug_key').on(table.slug),
  };
});

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    slugIndex: uniqueIndex('modules_slug_key').on(table.slug),
  };
});

export const learningPathModules = pgTable('learning_path_modules', {
  learningPathId: uuid('learning_path_id').notNull().references(() => learningPaths.id),
  moduleId: uuid('module_id').notNull().references(() => modules.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: { primaryKey: [table.learningPathId, table.moduleId] },
  };
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  type: text('type', { enum: ['image', 'video'] }).notNull(),
  altText: text('alt_text'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contentChunks = pgTable('content_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  module_id: uuid('module_id').notNull().references(() => modules.id),
  sequence_order: integer('sequence_order').notNull(),
  title: text('title'),
  description: text('description'),
  type: text('type', {
    enum: [
      'lesson', 'metalesson', 'introduction', 'conclusion', 'example', 'application', 'image', 'video'
    ]
  }).notNull(),
  nextAction: text('next_action', {
    enum: ['getNext', 'checkIn', 'assessment', 'studio', 'nextModule']
  }).notNull(),
  content: text('content').notNull(),
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id),
  display_type: text('display_type', {
    enum: ['message', 'card', 'card_carousel']
  }).notNull().default('message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  // Add a role column for the user's role, default to 'user'
  role: text('role').notNull().default('user'),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const sequences = pgTable('sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    slugIndex: uniqueIndex('sequences_slug_key').on(table.slug),
  };
});

export const sequenceModules = pgTable('sequence_modules', {
  sequenceId: uuid('sequence_id').notNull().references(() => sequences.id),
  moduleId: uuid('module_id').notNull().references(() => modules.id),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.sequenceId, table.moduleId] }),
  };
});

export const learningPathSequences = pgTable('learning_path_sequences', {
  learningPathId: uuid('learning_path_id').notNull().references(() => learningPaths.id),
  sequenceId: uuid('sequence_id').notNull().references(() => sequences.id),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.learningPathId, table.sequenceId] }),
  };
});

// User Progress Tracking Tables
export const userLearningPathProgress = pgTable('user_learning_path_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id),
  learningPathId: uuid('learning_path_id').notNull().references(() => learningPaths.id),
  status: text('status', { enum: ['not_started', 'in_progress', 'completed'] }).notNull().default('not_started'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userPathIndex: uniqueIndex('user_learning_path_idx').on(table.userId, table.learningPathId),
  };
});

export const userSequenceProgress = pgTable('user_sequence_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id),
  sequenceId: uuid('sequence_id').notNull().references(() => sequences.id),
  status: text('status', { enum: ['not_started', 'in_progress', 'completed'] }).notNull().default('not_started'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userSequenceIndex: uniqueIndex('user_sequence_idx').on(table.userId, table.sequenceId),
  };
});

export const userModuleProgress = pgTable('user_module_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id),
  moduleId: uuid('module_id').notNull().references(() => modules.id),
  status: text('status', { enum: ['not_started', 'in_progress', 'completed'] }).notNull().default('not_started'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userModuleIndex: uniqueIndex('user_module_idx').on(table.userId, table.moduleId),
  };
});

export const userContentChunkProgress = pgTable('user_content_chunk_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id),
  contentChunkId: uuid('content_chunk_id').notNull().references(() => contentChunks.id),
  status: text('status', { enum: ['not_started', 'in_progress', 'completed'] }).notNull().default('not_started'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userChunkIndex: uniqueIndex('user_chunk_idx').on(table.userId, table.contentChunkId),
  };
});

// Additional type exports for tables without inline type exports
export type LearningPath = InferSelectModel<typeof learningPaths>;
export type Module = InferSelectModel<typeof modules>;
export type LearningPathModule = InferSelectModel<typeof learningPathModules>;
export type MediaAsset = InferSelectModel<typeof mediaAssets>;
export type ContentChunk = InferSelectModel<typeof contentChunks>;
export type Sequence = InferSelectModel<typeof sequences>;
export type SequenceModule = InferSelectModel<typeof sequenceModules>;
export type LearningPathSequence = InferSelectModel<typeof learningPathSequences>;
export type UserLearningPathProgress = InferSelectModel<typeof userLearningPathProgress>;
export type UserSequenceProgress = InferSelectModel<typeof userSequenceProgress>;
export type UserModuleProgress = InferSelectModel<typeof userModuleProgress>;
export type UserContentChunkProgress = InferSelectModel<typeof userContentChunkProgress>;
