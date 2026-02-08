"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/capture", label: "Capture" },
  { href: "/query", label: "Query" },
  { href: "/docs", label: "Docs" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--foreground)]/10 sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            Echo
          </Link>
          <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === href
                      ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                      : "text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            {status === "loading" ? (
              <li className="px-3 py-2 text-sm text-[var(--foreground)]/50">…</li>
            ) : session ? (
              <li className="flex items-center gap-2">
                <span className="text-sm text-[var(--foreground)]/70 max-w-[120px] truncate" title={session.user?.email ?? undefined}>
                  {session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
