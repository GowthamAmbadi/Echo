import type { AIProvider } from "./types";
import { openAIProvider } from "./openai";

/**
 * Single point to swap AI provider (OpenAI, Claude, Gemini).
 */
export const aiProvider: AIProvider = openAIProvider;
export type { AIProvider, AISummarizeInput, AITagInput, AIQueryInput } from "./types";
