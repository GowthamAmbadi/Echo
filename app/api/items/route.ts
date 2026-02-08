import { NextRequest, NextResponse } from "next/server";
import { getItems, createItem } from "@/lib/services/items";
import { auth } from "@/lib/auth";
import type { ItemType } from "@/lib/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const type = (searchParams.get("type") as ItemType | null) ?? undefined;
    const rawTagIds = searchParams.getAll("tagId");
    const tagIds = rawTagIds.filter((id) => UUID_REGEX.test(id));
    const sort =
      (searchParams.get("sort") as "date-desc" | "date-asc") ?? "date-desc";

    const items = await getItems({
      userId: session.user.id,
      q: q || undefined,
      type,
      tagIds: tagIds.length ? tagIds : undefined,
      sort,
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, content, type, sourceUrl, tags } = body;
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "title, content, and type are required" },
        { status: 400 }
      );
    }
    if (!["note", "link", "insight"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    const item = await createItem({
      userId: session.user.id,
      title: String(title).trim(),
      content: String(content).trim(),
      type: type as ItemType,
      sourceUrl: sourceUrl ? String(sourceUrl) : undefined,
      tags: Array.isArray(tags) ? tags.map(String) : undefined,
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
