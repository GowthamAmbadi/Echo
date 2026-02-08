-- Create enum for item type
CREATE TYPE "item_type" AS ENUM('note', 'link', 'insight');

-- Knowledge items table
CREATE TABLE IF NOT EXISTS "knowledge_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "type" "item_type" NOT NULL,
  "source_url" text,
  "summary" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Tags table
CREATE TABLE IF NOT EXISTS "tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL UNIQUE,
  "slug" text NOT NULL UNIQUE
);

-- Junction table
CREATE TABLE IF NOT EXISTS "knowledge_item_tags" (
  "item_id" uuid NOT NULL REFERENCES "knowledge_items"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  PRIMARY KEY ("item_id", "tag_id")
);
