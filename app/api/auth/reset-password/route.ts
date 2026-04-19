import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { passwordResetToken, prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { hashPasswordResetToken } from "@/lib/password-reset-token";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { token, password } = parsed.data;
    const tokenHash = hashPasswordResetToken(token);

    const row = await passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!row || row.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "Bağlantı geçersiz veya süresi dolmuş" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: row.email },
      select: { id: true },
    });
    if (!user) {
      await passwordResetToken.delete({ where: { tokenHash } });
      return NextResponse.json(
        { error: "Bağlantı geçersiz veya süresi dolmuş" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      await (
        tx as unknown as {
          passwordResetToken: {
            deleteMany: (args: {
              where: { email: string };
            }) => Promise<unknown>;
          };
        }
      ).passwordResetToken.deleteMany({ where: { email: row.email } });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Şifre güncellenemedi" },
      { status: 500 },
    );
  }
}
