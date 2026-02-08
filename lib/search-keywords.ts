/**
 * Extract search keywords from a natural-language question
 * so retrieval matches relevant items (e.g. "What have I saved about sleep?" → "sleep").
 */
const STOP_WORDS = new Set(
  [
    "what", "have", "has", "i", "me", "my", "saved", "about", "the", "a", "an",
    "is", "are", "was", "were", "do", "does", "did", "can", "could", "would",
    "should", "will", "all", "any", "my", "our", "your", "their", "this", "that",
    "these", "those", "it", "its", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "from", "by", "as", "into", "through", "during", "before",
    "after", "above", "below", "between", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "which", "who",
    "whom", "if", "than", "so", "just", "only", "also", "more", "most", "other",
    "some", "such", "no", "not", "own", "same", "too", "very", "you", "we", "they",
  ]
);

const MIN_WORD_LENGTH = 2;

export function extractSearchQuery(question: string): string {
  const trimmed = question.trim();
  if (!trimmed) return trimmed;

  const words = trimmed
    .toLowerCase()
    .replace(/[?!.,;:'"]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w));

  if (words.length === 0) return trimmed;
  // Use the longest substantive word (often the topic); fallback to first word
  const best = words.reduce((a, b) => (a.length >= b.length ? a : b));
  return best;
}
