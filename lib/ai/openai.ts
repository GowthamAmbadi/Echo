import OpenAI from "openai";
import type { AIProvider } from "./types";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set; AI features will fail at runtime.");
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;

export const openAIProvider: AIProvider = {
  async summarize({ title, content }) {
    if (!openai) throw new Error("OPENAI_API_KEY is not set");
    const text = [title, content].filter(Boolean).join("\n\n");
    const { choices } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Summarize the following in 2-3 concise sentences. Output only the summary, no preamble.\n\n${text.slice(0, 8000)}`,
        },
      ],
      max_tokens: 150,
    });
    const summary = choices[0]?.message?.content?.trim() ?? "";
    return summary;
  },

  async suggestTags({ title, content }) {
    if (!openai) throw new Error("OPENAI_API_KEY is not set");
    const text = [title, content].filter(Boolean).join("\n\n");
    const { choices } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Suggest 3-5 short tags (single words or two words) for this content. Output only the tags, comma-separated, lowercase.\n\n${text.slice(0, 6000)}`,
        },
      ],
      max_tokens: 80,
    });
    const raw = choices[0]?.message?.content?.trim() ?? "";
    return raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
  },

  async answerFromContext({ question, contextItems }) {
    if (!openai) throw new Error("OPENAI_API_KEY is not set");
    const context = contextItems
      .map(
        (i) =>
          `Title: ${i.title}\n${i.summary ? `Summary: ${i.summary}\n` : ""}Content: ${i.content.slice(0, 1500)}`
      )
      .join("\n\n---\n\n");
    const { choices } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Answer the question using only the following notes. If the notes don't contain enough information, say so. Be concise.\n\nNotes:\n${context.slice(0, 12000)}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 500,
    });
    const answer = choices[0]?.message?.content?.trim() ?? "I couldn't generate an answer.";
    return { answer };
  },
};
