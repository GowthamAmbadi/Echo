import { NextRequest, NextResponse } from "next/server";
import { getItemById, updateItem } from "@/lib/services/items";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const item = await getItemById(id, session.user.id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { summary, title, content, sourceUrl } = body;
    const update: { summary?: string; title?: string; content?: string; sourceUrl?: string } = {};
    if (typeof summary === "string") update.summary = summary;
    if (typeof title === "string") update.title = title;
    if (typeof content === "string") update.content = content;
    if (typeof sourceUrl === "string") update.sourceUrl = sourceUrl;
    const item = await updateItem(id, update, session.user.id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
