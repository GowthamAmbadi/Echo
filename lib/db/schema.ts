import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const itemTypeEnum = pgEnum("item_type", ["note", "link", "insight"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledgeItems = pgTable("knowledge_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: itemTypeEnum("type").notNull(),
  sourceUrl: text("source_url"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const knowledgeItemTags = pgTable(
  "knowledge_item_tags",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => knowledgeItems.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.tagId] })]
);

export const usersRelations = relations(users, ({ many }) => ({
  knowledgeItems: many(knowledgeItems),
}));

export const knowledgeItemsRelations = relations(knowledgeItems, ({ one, many }) => ({
  user: one(users),
  knowledgeItemTags: many(knowledgeItemTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  knowledgeItemTags: many(knowledgeItemTags),
}));

export const knowledgeItemTagsRelations = relations(
  knowledgeItemTags,
  ({ one }) => ({
    item: one(knowledgeItems),
    tag: one(tags),
  })
);
