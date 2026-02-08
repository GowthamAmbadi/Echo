"use client";

import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

export default function DocsPage() {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert"
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Architecture & design
        </h1>
        <p className="text-[var(--foreground)]/70 mb-10">
          How Echo is built: portable layers, UX principles, agent
          automation, and public infrastructure.
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">1. Portable architecture</h2>
          <p className="text-[var(--foreground)]/80 mb-4">
            The app is structured so that key layers can be swapped without
            changing the rest of the system. Each layer lives behind an
            interface or a single entry point.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[var(--foreground)]/80">
            <li>
              <strong>AI provider</strong> — <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">lib/ai/types.ts</code> defines the{" "}
              <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">AIProvider</code> interface (summarize, suggestTags,
              answerFromContext). <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">lib/ai/openai.ts</code> implements it with OpenAI;
              Claude or Gemini can be added as alternative files and selected in{" "}
              <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">lib/ai/index.ts</code>.
            </li>
            <li>
              <strong>Database</strong> — Drizzle ORM with PostgreSQL (Neon).
              Schema and queries live in <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">lib/db/</code>. Switching to another
              SQL provider or MongoDB would mean replacing the Drizzle client and
              schema in that folder; API routes and services would stay the same
              if the service layer in <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">lib/services/</code> is kept.
            </li>
            <li>
              <strong>Search</strong> — Today retrieval is keyword-based via{" "}
              <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">getItems(&#123; q: &quot;...&quot; &#125;)</code>. A vector search implementation
              (e.g. pgvector or Pinecone) can be added behind the same service
              API so that <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">/api/ai/query</code> and the public brain
              query continue to work unchanged.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            2. Principles-based UX (AI interactions)
          </h2>
          <p className="text-[var(--foreground)]/80 mb-4">
            These principles guide how we expose AI features in the UI:
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-[var(--foreground)]/80">
            <li>
              <strong>Always show sources</strong> — When the system answers a
              question, it returns and displays the source items. Users can
              verify and dig deeper.
            </li>
            <li>
              <strong>Explicit AI actions</strong> — Summarization and
              auto-tagging are triggered by clear buttons (“Generate summary”,
              “Auto-tag”), not automatically in the background, so the user stays
              in control.
            </li>
            <li>
              <strong>Clear loading and error states</strong> — Buttons show
              “Generating…”, “Tagging…”, etc.; errors are surfaced in the UI
              instead of failing silently.
            </li>
            <li>
              <strong>Progressive disclosure</strong> — The main flow is capture
              and browse; AI features are available on the item page and on the
              Query page without cluttering the core capture form.
            </li>
            <li>
              <strong>User stays in control</strong> — AI suggests; the user can
              edit summaries and tags. The system does not overwrite user content
              without an explicit action.
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">3. Agent thinking</h2>
          <p className="text-[var(--foreground)]/80 mb-4">
            One way the system can “maintain or improve itself” over time is
            through an automation that backfills missing AI-generated data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[var(--foreground)]/80">
            <li>
              <strong>Backfill summaries and tags</strong> — A script or
              cron-triggered job (e.g. Vercel Cron or a separate worker) can:
              (1) list items where <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">summary</code> is null or where the item
              has no tags; (2) call the same logic as <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">POST /api/ai/summarize</code> and{" "}
              <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">POST /api/ai/tag</code> for each such item; (3) persist the results.
              This improves consistency and makes search/query more useful
              without user action. The implementation would live in a script
              (e.g. <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">scripts/backfill-ai.ts</code>) or an API route protected by a
              secret (e.g. <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">POST /api/cron/backfill-ai</code>) invoked by a scheduler.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            4. Infrastructure mindset: Public API
          </h2>
          <p className="text-[var(--foreground)]/80 mb-4">
            Echo is exposed for external use via a public API:
          </p>
          <p className="text-[var(--foreground)]/80 mb-2">
            <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">GET /api/public/brain/query?q=...</code>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-[var(--foreground)]/80">
            <li>
              <strong>Response</strong>: JSON with <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">answer</code> (string) and{" "}
              <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">sources</code> (array of{" "}
              <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">id, title, snippet</code>).
            </li>
            <li>
              If <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">PUBLIC_BRAIN_API_KEY</code> is set, requests must include{" "}
              <code className="text-sm bg-[var(--foreground)]/10 px-1 rounded">x-api-key</code> with that value.
            </li>
          </ul>
        </section>
      </motion.div>
    </Layout>
  );
}
