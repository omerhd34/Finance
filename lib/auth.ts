import type { Prisma } from "@prisma/client";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeUserCurrency } from "@/lib/currency";

type JwtProfileRow = {
  currency: string;
  phone: string | null;
  password: string | null;
  notificationsEnabled: boolean;
  image: string | null;
  planTier: string;
};

const jwtProfileSelect = {
  currency: true,
  phone: true,
  password: true,
  notificationsEnabled: true,
  image: true,
  planTier: true,
} as const satisfies Record<keyof JwtProfileRow, true>;

function resolveAuthSecret(): string | undefined {
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") {
    return "iqfinansai-local-dev-secret-set-env-in-production";
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
      }
      const shouldSyncProfile =
        Boolean(token.id) && (Boolean(user) || token.hasPassword === undefined);
      if (shouldSyncProfile) {
        const dbUser = (await prisma.user.findUnique({
          where: { id: token.id as string },
          select: jwtProfileSelect as unknown as Prisma.UserSelect,
        })) as JwtProfileRow | null;
        if (dbUser) {
          token.currency = dbUser.currency ?? "TL";
          token.phone = dbUser.phone ?? null;
          token.hasPassword = Boolean(dbUser.password);
          token.notificationsEnabled = dbUser.notificationsEnabled ?? true;
          token.picture = dbUser.image ?? null;
          token.planTier = dbUser.planTier === "premium" ? "premium" : "free";
        }
      }
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as {
          reloadUser?: unknown;
          currency?: unknown;
          phone?: unknown;
          name?: unknown;
          email?: unknown;
          notificationsEnabled?: unknown;
          image?: unknown;
        };
        if (s.reloadUser === true && token.id) {
          const dbUser = (await prisma.user.findUnique({
            where: { id: token.id as string },
            select: jwtProfileSelect as unknown as Prisma.UserSelect,
          })) as JwtProfileRow | null;
          if (dbUser) {
            token.currency = dbUser.currency ?? "TL";
            token.phone = dbUser.phone ?? null;
            token.hasPassword = Boolean(dbUser.password);
            token.notificationsEnabled = dbUser.notificationsEnabled ?? true;
            token.picture = dbUser.image ?? null;
            token.planTier = dbUser.planTier === "premium" ? "premium" : "free";
          }
        }
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
        if (typeof s.notificationsEnabled === "boolean") {
          token.notificationsEnabled = s.notificationsEnabled;
        }
        if ("image" in s) {
          if (typeof s.image === "string") {
            token.picture = s.image;
          } else if (s.image === null) {
            token.picture = null;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.currency = (token.currency as string | undefined) ?? "TL";
        session.user.phone = (token.phone as string | null | undefined) ?? null;
        session.user.hasPassword = Boolean(token.hasPassword);
        session.user.notificationsEnabled =
          (token.notificationsEnabled as boolean | undefined) !== false;
        const pic = (token as { picture?: string | null }).picture;
        if (pic !== undefined) {
          session.user.image = pic;
        }
        session.user.planTier =
          (token as { planTier?: string }).planTier === "premium"
            ? "premium"
            : "free";
      }
      return session;
    },
  },
});
