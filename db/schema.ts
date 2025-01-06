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
