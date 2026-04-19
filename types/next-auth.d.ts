import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      currency?: string;
      phone?: string | null;
      hasPassword?: boolean;
      notificationsEnabled?: boolean;
      planTier?: "free" | "premium";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    currency?: string;
    phone?: string | null;
    hasPassword?: boolean;
    notificationsEnabled?: boolean;
    planTier?: "free" | "premium";
  }
}
