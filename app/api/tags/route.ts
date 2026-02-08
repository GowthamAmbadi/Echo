import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/services/items";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tags = await getAllTags();
    return NextResponse.json(tags);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
