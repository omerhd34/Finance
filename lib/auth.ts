import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeUserCurrency } from "@/lib/currency";

function resolveAuthSecret(): string | undefined {
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") {
    return "finansiq-local-dev-secret-set-env-in-production";
  }
  return undefined;
}

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: resolveAuthSecret(),
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email);
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { currency: true, phone: true },
        });
        token.currency = dbUser?.currency ?? "TL";
        token.phone = dbUser?.phone ?? null;
      }
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as {
          currency?: unknown;
          phone?: unknown;
          name?: unknown;
          email?: unknown;
        };
        if (typeof s.currency === "string") {
          token.currency = normalizeUserCurrency(s.currency);
        }
        if ("phone" in s) {
          token.phone =
            typeof s.phone === "string"
              ? s.phone.trim() === ""
                ? null
                : s.phone.trim()
              : null;
        }
        if (typeof s.name === "string") token.name = s.name;
        if (typeof s.email === "string") token.email = s.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.currency = (token.currency as string | undefined) ?? "TL";
        session.user.phone = (token.phone as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});
