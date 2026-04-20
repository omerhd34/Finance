import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailWithRawToken } from "@/lib/verify-email-token-server";

const bodySchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const result = await verifyEmailWithRawToken(parsed.data.token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
