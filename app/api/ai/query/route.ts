import { NextRequest, NextResponse } from "next/server";
import { getItems } from "@/lib/services/items";
import { aiProvider } from "@/lib/ai";
import { extractSearchQuery } from "@/lib/search-keywords";
import { auth } from "@/lib/auth";

const MAX_CONTEXT_ITEMS = 10;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { question } = body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }
    const searchQuery = extractSearchQuery(question.trim());
    const items = await getItems({
      userId: session.user.id,
      q: searchQuery || question.trim(),
      sort: "date-desc",
    });
    const contextItems = items.slice(0, MAX_CONTEXT_ITEMS).map((item) => ({
      title: item.title,
      content: item.content,
      summary: item.summary,
    }));

    if (contextItems.length === 0) {
      return NextResponse.json({
        answer:
          "I don't have any notes that match your question. Try adding more items or using different keywords.",
        sources: [],
      });
    }

    const { answer } = await aiProvider.answerFromContext({
      question: question.trim(),
      contextItems,
    });
    const sources = items.slice(0, MAX_CONTEXT_ITEMS).map((item) => ({
      id: item.id,
      title: item.title,
      snippet: (item.summary || item.content).slice(0, 200),
    }));
    return NextResponse.json({ answer, sources });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Query failed" },
      { status: 500 }
    );
  }
}
