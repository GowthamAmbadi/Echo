/**
 * Seed script: run with npx tsx scripts/seed.ts
 * Requires DATABASE_URL in env.
 * Idempotent: skips inserting items if they already exist (by title).
 */
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { knowledgeItems, tags, knowledgeItemTags } from "../lib/db/schema";

const SEED_ITEMS = [
  {
    title: "Welcome to Echo",
    content:
      "Echo is a place to capture notes, links, and insights. Use the capture form to add new items, then let AI summarize and tag them. You can query everything conversationally from the Query page.",
    type: "note" as const,
    summary: "An intro note explaining how to use the Echo app.",
    sourceUrl: null as string | null,
    tagSlug: "productivity",
  },
  {
    title: "Building a Knowledge System",
    content:
      "Effective knowledge management involves capture, organization, and retrieval. Tools like Zettelkasten and PARA help structure information. AI can assist with summarization and semantic search.",
    type: "insight" as const,
    summary: "Thoughts on knowledge systems and how AI augments them.",
    sourceUrl: "https://example.com/knowledge-systems",
    tagSlug: "learning",
  },
];

async function seed() {
  await db.insert(tags).values([
    { name: "productivity", slug: "productivity" },
    { name: "learning", slug: "learning" },
  ]).onConflictDoNothing({ target: tags.slug });

  const tagRows = await db.select().from(tags).where(eq(tags.slug, "productivity")).limit(1);
  const tagRows2 = await db.select().from(tags).where(eq(tags.slug, "learning")).limit(1);
  const t1 = tagRows[0];
  const t2 = tagRows2[0];

  for (const seedItem of SEED_ITEMS) {
    const [existing] = await db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.title, seedItem.title))
      .limit(1);

    let itemId: string;
    if (existing) {
      itemId = existing.id;
    } else {
      const [inserted] = await db
        .insert(knowledgeItems)
        .values({
          title: seedItem.title,
          content: seedItem.content,
          type: seedItem.type,
          sourceUrl: seedItem.sourceUrl,
          summary: seedItem.summary,
        })
        .returning();
      if (!inserted) continue;
      itemId = inserted.id;
    }

    const tag = seedItem.tagSlug === "productivity" ? t1 : t2;
    if (tag) {
      await db
        .insert(knowledgeItemTags)
        .values({ itemId, tagId: tag.id })
        .onConflictDoNothing();
    }
  }

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
