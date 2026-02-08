"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

type Item = {
  id: string;
  title: string;
  content: string;
  type: string;
  sourceUrl: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string; slug: string }[];
};

export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [tagging, setTagging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSummarize() {
    if (!id || summarizing) return;
    setSummarizing(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setItem(data.item);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  }

  async function handleAutoTag() {
    if (!id || tagging) return;
    setTagging(true);
    try {
      const res = await fetch("/api/ai/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setItem(data.item);
    } catch (err) {
      console.error(err);
    } finally {
      setTagging(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-[var(--foreground)]/10 rounded w-3/4" />
          <div className="h-4 bg-[var(--foreground)]/10 rounded w-1/4" />
          <div className="h-20 bg-[var(--foreground)]/10 rounded w-full" />
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-[var(--foreground)]/70 mb-4">Item not found.</p>
          <Link
            href="/dashboard"
            className="text-[var(--foreground)] underline hover:no-underline"
          >
            Back to dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Link
          href="/dashboard"
          className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] mb-4 inline-block"
        >
          ← Dashboard
        </Link>
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${
            item.type === "note"
              ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
              : item.type === "link"
                ? "bg-green-500/20 text-green-700 dark:text-green-300"
                : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
          }`}
        >
          {item.type}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          {item.title}
        </h1>
        <p className="text-sm text-[var(--foreground)]/60 mb-4">
          {new Date(item.createdAt).toLocaleString()}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={handleSummarize}
            disabled={summarizing}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 disabled:opacity-50 transition-colors"
          >
            {summarizing ? "Generating…" : "Generate summary"}
          </button>
          <button
            type="button"
            onClick={handleAutoTag}
            disabled={tagging}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 disabled:opacity-50 transition-colors"
          >
            {tagging ? "Tagging…" : "Auto-tag"}
          </button>
        </div>
        {item.summary && (
          <div className="rounded-lg bg-[var(--foreground)]/5 p-4 mb-6">
            <p className="text-sm font-medium text-[var(--foreground)]/80 mb-1">
              Summary
            </p>
            <p className="text-[var(--foreground)]/90">{item.summary}</p>
          </div>
        )}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{item.content}</p>
        </div>
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-[var(--foreground)]/70 hover:underline"
          >
            Source: {item.sourceUrl}
          </a>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {item.tags.map((t) => (
              <span
                key={t.id}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--foreground)]/10"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </motion.article>
    </Layout>
  );
}
