"use client";

import { useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

type Source = { id: string; title: string; snippet: string };

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setError("");
    setAnswer("");
    setSources([]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Query failed");
      setAnswer(data.answer);
      setSources(data.sources ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Ask Echo
        </h1>
        <p className="text-[var(--foreground)]/70 text-sm mb-6">
          Ask a question and get an answer from your knowledge base.
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What have I learned about productivity?"
              className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
              disabled={loading}
              aria-label="Question"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
            >
              {loading ? "Asking…" : "Ask"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </form>

        {loading && (
          <div className="animate-pulse space-y-3 mb-6">
            <div className="h-4 bg-[var(--foreground)]/10 rounded w-full" />
            <div className="h-4 bg-[var(--foreground)]/10 rounded w-5/6" />
            <div className="h-4 bg-[var(--foreground)]/10 rounded w-4/6" />
          </div>
        )}

        {answer && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Answer
            </h2>
            <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-4">
              <p className="whitespace-pre-wrap text-[var(--foreground)]/90">
                {answer}
              </p>
            </div>
          </motion.div>
        )}

        {sources.length > 0 && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Sources
            </h2>
            <ul className="space-y-2 list-none p-0 m-0">
              {sources.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/item/${s.id}`}
                    className="block rounded-lg border border-[var(--foreground)]/10 p-3 hover:border-[var(--foreground)]/25 hover:bg-[var(--foreground)]/5 transition-colors"
                  >
                    <span className="font-medium">{s.title}</span>
                    {s.snippet && (
                      <p className="text-sm text-[var(--foreground)]/70 mt-1 line-clamp-2">
                        {s.snippet}…
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </motion.div>
    </Layout>
  );
}
