import { Prisma } from "@prisma/client";
import { emailVerificationToken, prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset-token";

export type VerifyEmailTokenResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

export async function verifyEmailWithRawToken(
  rawToken: string,
): Promise<VerifyEmailTokenResult> {
  const trimmed = rawToken.trim();
  if (!trimmed) {
    return { ok: false, error: "Geçersiz istek.", status: 400 };
  }

  try {
    const tokenHash = hashPasswordResetToken(trimmed);
    const row = await emailVerificationToken.findUnique({
      where: { tokenHash },
      select: { userId: true, expiresAt: true },
    });

    if (!row) {
      return {
        ok: false,
        error: "Bağlantı geçersiz veya süresi dolmuş.",
        status: 400,
      };
    }

    if (row.expiresAt.getTime() < Date.now()) {
      await emailVerificationToken.deleteMany({ where: { tokenHash } });
      return {
        ok: false,
        error: "Bağlantının süresi dolmuş. Yeni doğrulama e-postası isteyin.",
        status: 400,
      };
    }

    await prisma.user.update({
      where: { id: row.userId },
      data: { emailVerified: new Date() },
    });
    await emailVerificationToken.deleteMany({ where: { tokenHash } });

    return { ok: true };
  } catch (e) {
    console.error("[verify-email-token-server]", e);
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2021"
    ) {
      return {
        ok: false,
        error: "Veritabanı tablosu eksik. Yönetici migration çalıştırmalıdır.",
        status: 503,
      };
    }
    return {
      ok: false,
      error: "Doğrulama tamamlanamadı.",
      status: 500,
    };
  }
}
