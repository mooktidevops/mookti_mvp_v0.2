CREATE TABLE IF NOT EXISTS "sequences" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text,
    "slug" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "sequences_slug_key" ON "sequences" ("slug");

CREATE TABLE IF NOT EXISTS "sequence_modules" (
    "sequence_id" uuid NOT NULL REFERENCES "sequences" ("id"),
    "module_id" uuid NOT NULL REFERENCES "modules" ("id"),
    "order_index" integer NOT NULL,
    "created_at" timestamp DEFAULT now(),
    PRIMARY KEY ("sequence_id", "module_id")
);

CREATE TABLE IF NOT EXISTS "learning_path_sequences" (
    "learning_path_id" uuid NOT NULL REFERENCES "learning_paths" ("id"),
    "sequence_id" uuid NOT NULL REFERENCES "sequences" ("id"),
    "order_index" integer NOT NULL,
    "created_at" timestamp DEFAULT now(),
    PRIMARY KEY ("learning_path_id", "sequence_id")
);

CREATE TABLE IF NOT EXISTS "user_learning_path_progress" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "User" ("id"),
    "learning_path_id" uuid NOT NULL REFERENCES "learning_paths" ("id"),
    "status" text NOT NULL DEFAULT 'not_started' CHECK ("status" IN ('not_started', 'in_progress', 'completed')),
    "started_at" timestamp,
    "completed_at" timestamp,
    "last_accessed_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_learning_path_idx" ON "user_learning_path_progress" ("user_id", "learning_path_id");

CREATE TABLE IF NOT EXISTS "user_sequence_progress" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "User" ("id"),
    "sequence_id" uuid NOT NULL REFERENCES "sequences" ("id"),
    "status" text NOT NULL DEFAULT 'not_started' CHECK ("status" IN ('not_started', 'in_progress', 'completed')),
    "started_at" timestamp,
    "completed_at" timestamp,
    "last_accessed_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_sequence_idx" ON "user_sequence_progress" ("user_id", "sequence_id");

CREATE TABLE IF NOT EXISTS "user_module_progress" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "User" ("id"),
    "module_id" uuid NOT NULL REFERENCES "modules" ("id"),
    "status" text NOT NULL DEFAULT 'not_started' CHECK ("status" IN ('not_started', 'in_progress', 'completed')),
    "started_at" timestamp,
    "completed_at" timestamp,
    "last_accessed_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_module_idx" ON "user_module_progress" ("user_id", "module_id");

CREATE TABLE IF NOT EXISTS "user_content_chunk_progress" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "User" ("id"),
    "content_chunk_id" uuid NOT NULL REFERENCES "content_chunks" ("id"),
    "status" text NOT NULL DEFAULT 'not_started' CHECK ("status" IN ('not_started', 'in_progress', 'completed')),
    "started_at" timestamp,
    "completed_at" timestamp,
    "last_accessed_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_chunk_idx" ON "user_content_chunk_progress" ("user_id", "content_chunk_id"); 