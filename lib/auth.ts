import type { Prisma } from "@prisma/client";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeUserCurrency } from "@/lib/currency";
import { ensurePremiumNotExpired } from "@/lib/premium-subscription";

const MAX_JWT_PICTURE_CHARS = 2048;

function pictureForJwt(image: string | null | undefined): string | null {
  if (image == null || typeof image !== "string") return null;
  const t = image.trim();
  if (!t) return null;
  if (t.startsWith("data:")) return null;
  if (t.length > MAX_JWT_PICTURE_CHARS) return null;
  return t;
}

type JwtProfileRow = {
  currency: string;
  phone: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  monthStartDay: number;
  password: string | null;
  notificationsEnabled: boolean;
  image: string | null;
  planTier: string;
  emailVerified: Date | null;
};

const jwtProfileSelect = {
  currency: true,
  phone: true,
  profession: true,
  city: true,
  country: true,
  monthStartDay: true,
  password: true,
  notificationsEnabled: true,
  image: true,
  planTier: true,
  emailVerified: true,
} as const satisfies Record<keyof JwtProfileRow, true>;

function resolveAuthSecret(): string | undefined {
  const fromEnv = process.env.AUTH_SECRET?.trim();
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
  debug: process.env.AUTH_DEBUG === "1",
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/giris",
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
          image: pictureForJwt(user.image),
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
        await ensurePremiumNotExpired(token.id as string);
        const dbUser = (await prisma.user.findUnique({
          where: { id: token.id as string },
          select: jwtProfileSelect as unknown as Prisma.UserSelect,
        })) as JwtProfileRow | null;
        if (dbUser) {
          token.currency = dbUser.currency ?? "TL";
          token.phone = dbUser.phone ?? null;
          token.profession = dbUser.profession ?? null;
          token.city = dbUser.city ?? null;
          token.country = dbUser.country ?? null;
          token.monthStartDay = dbUser.monthStartDay ?? 1;
          token.hasPassword = Boolean(dbUser.password);
          token.notificationsEnabled = dbUser.notificationsEnabled ?? true;
          token.picture = pictureForJwt(dbUser.image);
          token.planTier = dbUser.planTier === "premium" ? "premium" : "free";
          token.isEmailVerified = Boolean(dbUser.emailVerified);
        }
      }
      if (token.id && token.isEmailVerified !== true) {
        const ev = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { emailVerified: true },
        });
        if (ev?.emailVerified) {
          token.isEmailVerified = true;
        }
      }
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as {
          reloadUser?: unknown;
          currency?: unknown;
          phone?: unknown;
          profession?: unknown;
          city?: unknown;
          country?: unknown;
          monthStartDay?: unknown;
          name?: unknown;
          email?: unknown;
          notificationsEnabled?: unknown;
          image?: unknown;
        };
        if (s.reloadUser === true && token.id) {
          await ensurePremiumNotExpired(token.id as string);
          const dbUser = (await prisma.user.findUnique({
            where: { id: token.id as string },
            select: jwtProfileSelect as unknown as Prisma.UserSelect,
          })) as JwtProfileRow | null;
          if (dbUser) {
            token.currency = dbUser.currency ?? "TL";
            token.phone = dbUser.phone ?? null;
            token.profession = dbUser.profession ?? null;
            token.city = dbUser.city ?? null;
            token.country = dbUser.country ?? null;
            token.monthStartDay = dbUser.monthStartDay ?? 1;
            token.hasPassword = Boolean(dbUser.password);
            token.notificationsEnabled = dbUser.notificationsEnabled ?? true;
            token.picture = pictureForJwt(dbUser.image);
            token.planTier = dbUser.planTier === "premium" ? "premium" : "free";
            token.isEmailVerified = Boolean(dbUser.emailVerified);
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
        if ("profession" in s) {
          token.profession =
            typeof s.profession === "string"
              ? s.profession.trim() === ""
                ? null
                : s.profession.trim()
              : null;
        }
        if ("city" in s) {
          token.city =
            typeof s.city === "string"
              ? s.city.trim() === ""
                ? null
                : s.city.trim()
              : null;
        }
        if ("country" in s) {
          token.country =
            typeof s.country === "string"
              ? s.country.trim() === ""
                ? null
                : s.country.trim()
              : null;
        }
        if (
          typeof s.monthStartDay === "number" &&
          Number.isInteger(s.monthStartDay)
        ) {
          token.monthStartDay = Math.min(28, Math.max(1, s.monthStartDay));
        }
        if (typeof s.name === "string") token.name = s.name;
        if (typeof s.email === "string") token.email = s.email;
        if (typeof s.notificationsEnabled === "boolean") {
          token.notificationsEnabled = s.notificationsEnabled;
        }
        if ("image" in s) {
          if (typeof s.image === "string") {
            token.picture = pictureForJwt(s.image);
          } else if (s.image === null) {
            token.picture = null;
          }
        }
      }
      {
        const t = token as { picture?: unknown; image?: unknown };
        const raw =
          typeof t.picture === "string"
            ? t.picture
            : typeof t.image === "string"
              ? t.image
              : null;
        t.picture = pictureForJwt(raw);
        delete t.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.currency = (token.currency as string | undefined) ?? "TL";
        session.user.phone = (token.phone as string | null | undefined) ?? null;
        session.user.profession =
          (token.profession as string | null | undefined) ?? null;
        session.user.city = (token.city as string | null | undefined) ?? null;
        session.user.country =
          (token.country as string | null | undefined) ?? null;
        session.user.monthStartDay =
          (token.monthStartDay as number | undefined) ?? 1;
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
        session.user.isEmailVerified = Boolean(
          (token as { isEmailVerified?: boolean }).isEmailVerified,
        );
      }
      return session;
    },
  },
});
