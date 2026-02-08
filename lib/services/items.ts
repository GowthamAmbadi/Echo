import { eq, desc, asc, and, or, ilike, inArray, isNull } from "drizzle-orm";
import { db } from "../db";
import { knowledgeItems, tags, knowledgeItemTags } from "../db/schema";
import type { ItemType } from "../types";

export type ItemWithTags = {
  id: string;
  title: string;
  content: string;
  type: "note" | "link" | "insight";
  sourceUrl: string | null;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags: { id: string; name: string; slug: string }[];
};

export async function getItems(opts?: {
  userId?: string | null;
  q?: string;
  type?: ItemType;
  tagIds?: string[];
  sort?: "date-desc" | "date-asc";
}): Promise<ItemWithTags[]> {
  const conditions = [];
  if (opts?.userId !== undefined) {
    if (opts.userId === null) {
      conditions.push(isNull(knowledgeItems.userId));
    } else {
      conditions.push(eq(knowledgeItems.userId, opts.userId));
    }
  }
  if (opts?.q?.trim()) {
    const q = `%${opts.q.trim()}%`;
    conditions.push(
      or(
        ilike(knowledgeItems.title, q),
        ilike(knowledgeItems.content, q),
        ilike(knowledgeItems.summary, q)
      )!
    );
  }
  if (opts?.type) {
    conditions.push(eq(knowledgeItems.type, opts.type));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const order =
    opts?.sort === "date-asc"
      ? asc(knowledgeItems.createdAt)
      : desc(knowledgeItems.createdAt);

  const rows = await db
    .select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      content: knowledgeItems.content,
      type: knowledgeItems.type,
      sourceUrl: knowledgeItems.sourceUrl,
      summary: knowledgeItems.summary,
      createdAt: knowledgeItems.createdAt,
      updatedAt: knowledgeItems.updatedAt,
    })
    .from(knowledgeItems)
    .where(whereClause)
    .orderBy(order);

  if (opts?.tagIds?.length) {
    const itemIdsWithTags = await db
      .select({ itemId: knowledgeItemTags.itemId })
      .from(knowledgeItemTags)
      .where(inArray(knowledgeItemTags.tagId, opts.tagIds));
    const validIds = new Set(itemIdsWithTags.map((r) => r.itemId));
    const filtered = rows.filter((r) => validIds.has(r.id));
    return attachTags(filtered);
  }

  return attachTags(rows);
}

async function attachTags(
  rows: {
    id: string;
    title: string;
    content: string;
    type: "note" | "link" | "insight";
    sourceUrl: string | null;
    summary: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[]
): Promise<ItemWithTags[]> {
  if (rows.length === 0) return [];
  const itemIds = rows.map((r) => r.id);
  const links = await db
    .select({
      itemId: knowledgeItemTags.itemId,
      tagId: knowledgeItemTags.tagId,
      name: tags.name,
      slug: tags.slug,
      id: tags.id,
    })
    .from(knowledgeItemTags)
    .innerJoin(tags, eq(knowledgeItemTags.tagId, tags.id))
    .where(inArray(knowledgeItemTags.itemId, itemIds));

  const tagMap = new Map<string, { id: string; name: string; slug: string }[]>();
  for (const l of links) {
    const arr = tagMap.get(l.itemId) ?? [];
    arr.push({ id: l.tagId, name: l.name, slug: l.slug });
    tagMap.set(l.itemId, arr);
  }

  return rows.map((r) => ({
    ...r,
    tags: tagMap.get(r.id) ?? [],
  }));
}

export async function getItemById(
  id: string,
  userId?: string | null
): Promise<ItemWithTags | null> {
  const conditions = [eq(knowledgeItems.id, id)];
  if (userId !== undefined) {
    if (userId === null) {
      conditions.push(isNull(knowledgeItems.userId));
    } else {
      conditions.push(eq(knowledgeItems.userId, userId));
    }
  }
  const [row] = await db
    .select()
    .from(knowledgeItems)
    .where(and(...conditions))
    .limit(1);
  if (!row) return null;
  const [withTags] = await attachTags([row]);
  return withTags ?? null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function createItem(data: {
  userId: string;
  title: string;
  content: string;
  type: ItemType;
  sourceUrl?: string;
  tags?: string[];
}): Promise<ItemWithTags> {
  const [item] = await db
    .insert(knowledgeItems)
    .values({
      userId: data.userId,
      title: data.title,
      content: data.content,
      type: data.type,
      sourceUrl: data.sourceUrl ?? null,
    })
    .returning();
  if (!item) throw new Error("Failed to create item");

  const tagNames = (data.tags ?? []).map((t) => t.trim()).filter(Boolean);
  if (tagNames.length) {
    for (const name of tagNames) {
      const slug = slugify(name);
      if (!slug) continue;
      const [tag] = await db
        .insert(tags)
        .values({ name, slug })
        .onConflictDoNothing({ target: tags.slug })
        .returning();
      const resolvedTag = tag ?? (await db.select().from(tags).where(eq(tags.slug, slug)).limit(1))[0];
      if (resolvedTag) {
        await db
          .insert(knowledgeItemTags)
          .values({ itemId: item.id, tagId: resolvedTag.id })
          .onConflictDoNothing();
      }
    }
  }

  const withTags = await getItemById(item.id, data.userId);
  return withTags!;
}

export async function updateItem(
  id: string,
  data: { summary?: string; title?: string; content?: string; sourceUrl?: string },
  userId?: string | null
): Promise<ItemWithTags | null> {
  const conditions = [eq(knowledgeItems.id, id)];
  if (userId !== undefined) {
    if (userId === null) conditions.push(isNull(knowledgeItems.userId));
    else conditions.push(eq(knowledgeItems.userId, userId));
  }
  await db
    .update(knowledgeItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(...conditions));
  return getItemById(id, userId);
}

export async function addTagsToItem(
  itemId: string,
  tagNames: string[],
  userId?: string | null
): Promise<ItemWithTags | null> {
  const item = await getItemById(itemId, userId);
  if (!item) return null;
  const names = tagNames.map((n) => n.trim()).filter(Boolean);
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    const [tag] = await db
      .insert(tags)
      .values({ name, slug })
      .onConflictDoNothing({ target: tags.slug })
      .returning();
    const resolvedTag =
      tag ?? (await db.select().from(tags).where(eq(tags.slug, slug)).limit(1))[0];
    if (resolvedTag) {
      await db
        .insert(knowledgeItemTags)
        .values({ itemId, tagId: resolvedTag.id })
        .onConflictDoNothing();
    }
  }
  return getItemById(itemId, userId);
}

export async function getAllTags(): Promise<{ id: string; name: string; slug: string }[]> {
  return db.select({ id: tags.id, name: tags.name, slug: tags.slug }).from(tags);
}
