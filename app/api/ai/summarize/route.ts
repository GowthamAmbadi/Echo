import { NextRequest, NextResponse } from "next/server";
import { getItemById, updateItem } from "@/lib/services/items";
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
    const summary = await aiProvider.summarize({
      title: item.title,
      content: item.content,
    });
    const updated = await updateItem(itemId, { summary }, session.user.id);
    return NextResponse.json({ summary, item: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Summarization failed" },
      { status: 500 }
    );
  }
}
