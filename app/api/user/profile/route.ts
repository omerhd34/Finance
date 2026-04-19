import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations";

const profileSelectFields = {
  id: true,
  name: true,
  email: true,
  phone: true,
  currency: true,
  image: true,
  notificationsEnabled: true,
  planTier: true,
} as const;

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const body: unknown = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { name, phone, currency, notificationsEnabled, image, planTier } =
      parsed.data;
    const data: Record<string, unknown> = {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && {
        phone: phone.trim() === "" ? null : phone.trim(),
      }),
      ...(currency !== undefined && { currency }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(image !== undefined && { image }),
      ...(planTier === "free" && { planTier: "free" }),
    };

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: data as Prisma.UserUpdateInput,
      select: profileSelectFields as unknown as Prisma.UserSelect,
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
