CREATE TABLE IF NOT EXISTS "learning_path_modules" (
	"learning_path_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"alt_text" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ContentChunk" RENAME TO "content_chunks";--> statement-breakpoint
ALTER TABLE "content_chunks" RENAME COLUMN "moduleId" TO "module_id";--> statement-breakpoint
ALTER TABLE "content_chunks" RENAME COLUMN "chunkId" TO "sequence_order";--> statement-breakpoint
ALTER TABLE "content_chunks" RENAME COLUMN "nextAction" TO "next_action";--> statement-breakpoint
ALTER TABLE "content_chunks" RENAME COLUMN "createdAt" TO "media_asset_id";--> statement-breakpoint
ALTER TABLE "content_chunks" RENAME COLUMN "updatedAt" TO "display_type";--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "module_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "next_action" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "media_asset_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "media_asset_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "media_asset_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "display_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "content_chunks" ALTER COLUMN "display_type" SET DEFAULT 'message';--> statement-breakpoint
ALTER TABLE "content_chunks" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "content_chunks" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_path_modules" ADD CONSTRAINT "learning_path_modules_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_path_modules" ADD CONSTRAINT "learning_path_modules_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "learning_paths_slug_key" ON "learning_paths" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "modules_slug_key" ON "modules" USING btree ("slug");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_chunks" ADD CONSTRAINT "content_chunks_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_chunks" ADD CONSTRAINT "content_chunks_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
