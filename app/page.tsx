"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0.3]);
  const scaleBg = useTransform(scrollYProgress, [0, 0.5], [1, 1.08]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-[var(--foreground)]/10 bg-[var(--background)]/80 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">
            Echo
          </span>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
            >
              Sign up
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
            >
              Docs
            </Link>
          </div>
        </nav>
      </header>

      <main ref={containerRef} className="relative">
        {/* Parallax background layer */}
        <motion.div
          style={{ y: yParallax, scale: scaleBg }}
          className="absolute inset-0 pointer-events-none"
          aria-hidden
        >
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-[var(--foreground)]/5 blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 rounded-full bg-[var(--foreground)]/[0.03] blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-80 h-80 rounded-full bg-[var(--foreground)]/5 blur-3xl" />
        </motion.div>

        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-24">
          <motion.div
            style={{ opacity: opacityHero }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Echo,
              <br />
              <span className="text-[var(--foreground)]/80">
                powered by AI
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg sm:text-xl text-[var(--foreground)]/70 mb-10 max-w-xl mx-auto"
            >
              Capture notes, links, and insights. Summarize and tag with AI.
              Query everything in plain language.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Open dashboard
              </Link>
              <Link
                href="/capture"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border-2 border-[var(--foreground)]/20 font-semibold hover:bg-[var(--foreground)]/5 transition-colors"
              >
                Capture something
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <section className="relative py-24 px-4">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-[var(--foreground)]/10 p-6 bg-[var(--foreground)]/[0.02]"
            >
              <h3 className="font-semibold text-lg mb-2">Capture</h3>
              <p className="text-sm text-[var(--foreground)]/70">
                Add notes, links, and insights with rich metadata and tags.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-[var(--foreground)]/10 p-6 bg-[var(--foreground)]/[0.02]"
            >
              <h3 className="font-semibold text-lg mb-2">AI</h3>
              <p className="text-sm text-[var(--foreground)]/70">
                Auto-summarize, suggest tags, and ask questions in natural language.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-[var(--foreground)]/10 p-6 bg-[var(--foreground)]/[0.02]"
            >
              <h3 className="font-semibold text-lg mb-2">Surface</h3>
              <p className="text-sm text-[var(--foreground)]/70">
                Search, filter, and query your knowledge base anytime.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative py-16 px-4 border-t border-[var(--foreground)]/10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[var(--foreground)]/60 text-sm">
              Public API available for integration.
            </p>
            <Link
              href="/docs"
              className="inline-block mt-2 text-sm font-medium text-[var(--foreground)]/80 hover:underline"
            >
              Read the docs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
