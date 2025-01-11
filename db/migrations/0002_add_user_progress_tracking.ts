import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  primaryKey
} from 'drizzle-orm/pg-core';

// Define base tables first
const user = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
});

const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
});

const learningPaths = pgTable('learning_paths', {
  id: uuid('id').primaryKey().defaultRandom(),
});

const contentChunks = pgTable('content_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
});

// Then define the new tables
export const sequences = pgTable('sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sequenceModules = pgTable('sequence_modules', {
  sequenceId: uuid('sequence_id').notNull().references(() => sequences.id),
  moduleId: uuid('module_id').notNull().references(() => modules.id),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.sequenceId, table.moduleId] })
}));

export const learningPathSequences = pgTable('learning_path_sequences', {
  learningPathId: uuid('learning_path_id').notNull().references(() => learningPaths.id),
  sequenceId: uuid('sequence_id').notNull().references(() => sequences.id),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.learningPathId, table.sequenceId] })
}));

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
}); 