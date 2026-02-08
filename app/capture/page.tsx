"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

type ItemType = "note" | "link" | "insight";

export default function CapturePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ItemType>("note");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          sourceUrl: sourceUrl.trim() || undefined,
          tags: tagsStr
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      router.push(`/item/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Capture knowledge
        </h1>
        <p className="text-[var(--foreground)]/70 text-sm mb-6">
          Add a note, link, or insight. Title and content are required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title"
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30 focus:border-[var(--foreground)]/30 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1.5">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full content or excerpt..."
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30 focus:border-[var(--foreground)]/30 transition-colors resize-y min-h-[120px]"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1.5">
              Type *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ItemType)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            >
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="insight">Insight</option>
            </select>
          </div>

          <div>
            <label htmlFor="sourceUrl" className="block text-sm font-medium mb-1.5">
              Source URL (optional)
            </label>
            <input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1.5">
              Tags (optional, comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="productivity, learning"
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2.5 rounded-lg border border-[var(--foreground)]/20 font-medium hover:bg-[var(--foreground)]/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </Layout>
  );
}
