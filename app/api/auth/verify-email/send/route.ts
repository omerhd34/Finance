import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { sendVerificationEmailForUserId } from "@/lib/email/send-verification-email";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const result = await sendVerificationEmailForUserId(session.user.id);

    if (!result.ok) {
      if (result.reason === "user_not_found") {
        return NextResponse.json(
          { error: "Kullanıcı bulunamadı" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "E-posta zaten doğrulanmış.", code: "ALREADY_VERIFIED" },
        { status: 400 },
      );
    }

    const { sent } = result;

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
