import { sendEmailVerificationMessage } from "@/lib/email-verification-email";
import { emailVerificationToken, prisma } from "@/lib/prisma";
import {
  appBaseUrl,
  generatePasswordResetSecret,
  hashPasswordResetToken,
} from "@/lib/password-reset-token";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export type SendVerificationEmailResult =
  | { ok: true; sent: boolean }
  | { ok: false; reason: "user_not_found" | "already_verified" };

export async function sendVerificationEmailForUserId(
  userId: string,
): Promise<SendVerificationEmailResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerified: true },
  });

  if (!user) {
    return { ok: false, reason: "user_not_found" };
  }
  if (user.emailVerified) {
    return { ok: false, reason: "already_verified" };
  }

  const rawToken = generatePasswordResetSecret();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  await emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });
  await emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const base = appBaseUrl();
  const verifyUrl = `${base}/eposta-dogrula?token=${encodeURIComponent(rawToken)}`;
  const sent = await sendEmailVerificationMessage({
    to: user.email,
    verifyUrl,
  });

  if (process.env.NODE_ENV === "development" && !sent) {
    console.info(
      "[send-verification-email] E-posta gönderilemedi; geliştirme için doğrulama URL:",
      verifyUrl,
    );
  }

  return { ok: true, sent };
}
