# Echo

An AI-powered knowledge system: capture notes, links, and insights; summarize and tag with AI; query your knowledge base conversationally.

## Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API routes
- **Database:** PostgreSQL (Neon or any Postgres) with Drizzle ORM
- **AI:** OpenAI (swappable via `lib/ai/`)

## Setup

1. Clone and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Set in `.env`:
   - `DATABASE_URL` — PostgreSQL connection string (e.g. Neon)
   - `OPENAI_API_KEY` — OpenAI API key for summarization, tagging, and query
   - `AUTH_SECRET` — Secret for NextAuth sessions (e.g. `openssl rand -base64 32`)
   - Optional: `PUBLIC_BRAIN_API_KEY` — if set, public query API requires `x-api-key` header

4. Create the database schema (run SQL in `drizzle/0000_init.sql` and `drizzle/0001_auth.sql` against your DB, or use Drizzle):

   ```bash
   npm run db:push
   ```

5. Seed (optional):

   ```bash
   npm run db:seed
   ```

6. Run locally:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy

- **Frontend:** Deploy to [Vercel](https://vercel.com) (Next.js).
- **Database:** Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for PostgreSQL; set `DATABASE_URL` in Vercel env.
- Set `OPENAI_API_KEY`, `AUTH_SECRET`, and optionally `PUBLIC_BRAIN_API_KEY` in Vercel.

## Auth

- **Login / Logout** — NextAuth with credentials (email + password). Dashboard, Capture, Query, and Item pages require login.
- **Register** — Sign up at `/register`; then sign in at `/login`.

## Routes

- `/` — Landing
- `/login` — Sign in
- `/register` — Create account
- `/dashboard` — List, search, filter, sort knowledge items (requires login)
- `/capture` — Create a new item (requires login)
- `/item/[id]` — Item detail; “Generate summary” and “Auto-tag” (requires login)
- `/query` — Conversational query over your knowledge (requires login)
- `/docs` — Architecture and design documentation

## Public API

- `GET /api/public/brain/query?q=...` — Returns `{ answer, sources }` (JSON). Optional `x-api-key` if `PUBLIC_BRAIN_API_KEY` is set.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run db:push` — Push schema to DB (Drizzle)
- `npm run db:seed` — Seed sample items (requires DB)
