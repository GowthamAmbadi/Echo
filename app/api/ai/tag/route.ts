import { NextRequest, NextResponse } from "next/server";
import { getItemById, addTagsToItem } from "@/lib/services/items";
import { aiProvider } from "@/lib/ai";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { itemId } = body;
    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }
    const item = await getItemById(itemId, session.user.id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    const suggestedTags = await aiProvider.suggestTags({
      title: item.title,
      content: item.content,
    });
    const updated = await addTagsToItem(itemId, suggestedTags, session.user.id);
    return NextResponse.json({ tags: suggestedTags, item: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Auto-tagging failed" },
      { status: 500 }
    );
  }
}
