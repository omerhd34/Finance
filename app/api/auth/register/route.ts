import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmailForUserId } from "@/lib/email/send-verification-email";
import { registerSchema } from "@/lib/schemas/validations";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta ile kayıtlı bir hesap var" },
        { status: 409 },
      );
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    let verificationEmailSent = false;
    try {
      const verifyResult = await sendVerificationEmailForUserId(user.id);
      if (verifyResult.ok) {
        verificationEmailSent = verifyResult.sent;
      }
    } catch (verifyErr) {
      console.error("[register] doğrulama e-postası gönderilemedi", verifyErr);
    }

    return NextResponse.json(
      { ok: true, verificationEmailSent },
      { status: 201 },
    );
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Kayıt başarısız" }, { status: 500 });
  }
}
