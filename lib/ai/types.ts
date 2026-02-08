/**
 * Portable AI provider interface.
 * Implementations: OpenAI, Claude, Gemini can be swapped in lib/ai/
 */

export interface AISummarizeInput {
  title: string;
  content: string;
}

export interface AITagInput {
  title: string;
  content: string;
}

export interface AIQueryInput {
  question: string;
  contextItems: { title: string; content: string; summary?: string | null }[];
}

export interface AIProvider {
  summarize(input: AISummarizeInput): Promise<string>;
  suggestTags(input: AITagInput): Promise<string[]>;
  answerFromContext(input: AIQueryInput): Promise<{ answer: string }>;
}
