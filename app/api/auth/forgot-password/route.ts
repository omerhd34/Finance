import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { passwordResetToken, prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import {
  appBaseUrl,
  generatePasswordResetSecret,
  hashPasswordResetToken,
} from "@/lib/password-reset-token";

const RESET_TTL_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { email } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: true, registered: false },
        { status: 200 },
      );
    }

    const rawToken = generatePasswordResetSecret();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await passwordResetToken.deleteMany({ where: { email } });
    await passwordResetToken.create({
      data: { email, tokenHash, expiresAt },
    });

    const base = appBaseUrl();
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const sent = await sendPasswordResetEmail({ to: email, resetUrl });

    if (process.env.NODE_ENV === "development" && !sent) {
      console.info(
        "[forgot-password] E-posta gönderilemedi; geliştirme için sıfırlama URL:",
        resetUrl,
      );
    }

    return NextResponse.json({ ok: true, registered: true }, { status: 200 });
  } catch (e) {
    console.error("[forgot-password]", e);
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2021"
    ) {
      return NextResponse.json(
        {
          error:
            "Şifre sıfırlama veritabanı tablosu eksik. Projede `npx prisma migrate deploy` (veya `migrate dev`) çalıştırın.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error:
          "İstek işlenemedi. Veritabanı bağlantısını kontrol edin veya daha sonra tekrar deneyin.",
      },
      { status: 500 },
    );
  }
}
