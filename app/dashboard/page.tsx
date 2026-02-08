"use client";

import { useEffect, useState, useCallback } from "react";
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
  tags: { id: string; name: string; slug: string }[];
};

type Tag = { id: string; name: string; slug: string };

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--foreground)]/10 p-4 animate-pulse">
      <div className="h-5 bg-[var(--foreground)]/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-[var(--foreground)]/10 rounded w-full mb-1" />
      <div className="h-3 bg-[var(--foreground)]/10 rounded w-2/3 mb-3" />
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded bg-[var(--foreground)]/10" />
        <div className="h-5 w-16 rounded bg-[var(--foreground)]/10" />
      </div>
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [tagFilterIds, setTagFilterIds] = useState<string[]>([]);
  const [sort, setSort] = useState<"date-desc" | "date-asc">("date-desc");

  const debouncedSearch = useDebounce(searchInput, 300);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
      if (typeFilter) params.set("type", typeFilter);
      tagFilterIds.forEach((tid) => params.append("tagId", tid));
      params.set("sort", sort);
      const res = await fetch(`/api/items?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, tagFilterIds, sort]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setTags(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTag = (tagId: string) => {
    setTagFilterIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-[var(--foreground)]/70 text-sm mt-0.5">
            All your knowledge in one place
          </p>
        </div>
        <Link
          href="/capture"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          New capture
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="search"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            aria-label="Search knowledge items"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "date-desc" | "date-asc")}
            className="px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            aria-label="Sort order"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[var(--foreground)]/60 mr-1">Type:</span>
          {["", "note", "link", "insight"].map((t) => (
            <button
              key={t || "all"}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                typeFilter === t
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"
              }`}
            >
              {t || "All"}
            </button>
          ))}
          {tags.length > 0 && (
            <>
              <span className="text-sm text-[var(--foreground)]/60 ml-2 mr-1">
                Tags:
              </span>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    tagFilterIds.includes(tag.id)
                      ? "bg-[var(--foreground)]/25 ring-1 ring-[var(--foreground)]/30"
                      : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-dashed border-[var(--foreground)]/20 p-12 text-center"
        >
          <p className="text-[var(--foreground)]/70 mb-4">
            {debouncedSearch || typeFilter || tagFilterIds.length
              ? "No items match your filters."
              : "No items yet. Capture your first note or link."}
          </p>
          {debouncedSearch || typeFilter || tagFilterIds.length ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setTypeFilter("");
                setTagFilterIds([]);
              }}
              className="text-sm text-[var(--foreground)]/70 hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/capture"
              className="inline-flex px-4 py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90"
            >
              Capture
            </Link>
          )}
        </motion.div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
            >
              <Link
                href={`/item/${item.id}`}
                className="block rounded-xl border border-[var(--foreground)]/10 p-4 hover:border-[var(--foreground)]/25 hover:shadow-md transition-all duration-200"
              >
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
                    item.type === "note"
                      ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                      : item.type === "link"
                        ? "bg-green-500/20 text-green-700 dark:text-green-300"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {item.type}
                </span>
                <h2 className="font-semibold text-lg mb-1 line-clamp-1">
                  {item.title}
                </h2>
                <p className="text-sm text-[var(--foreground)]/70 line-clamp-2 mb-2">
                  {item.summary || item.content}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--foreground)]/10"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[var(--foreground)]/50 mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
