import { NextRequest, NextResponse } from "next/server";
import { getItems } from "@/lib/services/items";
import { aiProvider } from "@/lib/ai";
import { extractSearchQuery } from "@/lib/search-keywords";

const MAX_CONTEXT_ITEMS = 10;

/**
 * Public API: GET /api/public/brain/query?q=...
 * Returns { answer, sources: [{ id, title, snippet }] }
 * Optional: x-api-key header for PUBLIC_BRAIN_API_KEY if set.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.PUBLIC_BRAIN_API_KEY;
  if (apiKey) {
    const headerKey = request.headers.get("x-api-key");
    if (headerKey !== apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const searchQuery = extractSearchQuery(q);
    const items = await getItems({
      userId: null,
      q: searchQuery || q,
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
      question: q,
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
      { error: "Query failed" },
      { status: 500 }
    );
  }
}
