"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      router.push("/login?callbackUrl=/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold tracking-tight mb-2 text-center">
          Create account
        </h1>
        <p className="text-[var(--foreground)]/70 text-sm text-center mb-6">
          Sign up to start using Echo
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-[var(--foreground)]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--foreground)]/70">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:no-underline">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-sm text-[var(--foreground)]/60 hover:underline">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
