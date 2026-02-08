-- Users table for authentication
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "name" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add user_id to knowledge_items (nullable for existing rows)
ALTER TABLE "knowledge_items" ADD COLUMN IF NOT EXISTS "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE;
