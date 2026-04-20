import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { sendEmailVerificationMessage } from "@/lib/email-verification-email";
import { emailVerificationToken, prisma } from "@/lib/prisma";
import {
  appBaseUrl,
  generatePasswordResetSecret,
  hashPasswordResetToken,
} from "@/lib/password-reset-token";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "E-posta zaten doğrulanmış." },
        { status: 400 },
      );
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
        "[verify-email/send] E-posta gönderilemedi; geliştirme için doğrulama URL:",
        verifyUrl,
      );
    }

    return NextResponse.json(
      {
        ok: true,
        sent,
        message: sent
          ? "Doğrulama bağlantısı e-posta adresinize gönderildi."
          : "E-posta yapılandırması eksik olabilir; geliştirme ortamında konsolu kontrol edin.",
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("[verify-email/send]", e);
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2021"
    ) {
      return NextResponse.json(
        {
          error:
            "E-posta doğrulama tablosu eksik. `npx prisma migrate deploy` çalıştırın.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "İstek işlenemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
