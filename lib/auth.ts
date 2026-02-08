import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "./services/users";
declare module "next-auth" {
  interface Session {
    user: { id: string; email?: string | null; name?: string | null };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(String(credentials.email));
        if (!user) return null;
        const ok = await verifyPassword(user, String(credentials.password));
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as Record<string, unknown>).id = user.id;
        (token as Record<string, unknown>).email = user.email;
        (token as Record<string, unknown>).name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as Record<string, unknown>;
      if (session.user) {
        const u = session.user as { id: string; email?: string | null; name?: string | null };
        u.id = (t.id as string) ?? "";
        u.email = (t.email as string | null) ?? null;
        u.name = (t.name as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
