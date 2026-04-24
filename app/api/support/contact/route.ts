import { NextResponse } from "next/server";
import {
  getSupportInboxEmail,
  sendSupportContactEmail,
} from "@/lib/support-contact-email";
import { supportContactClientSchema } from "@/lib/validations";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }

  const parsed = supportContactClientSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat()[0] ?? "Form verilerini kontrol edin.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { _contact_hp, ...fields } = parsed.data;
  if (_contact_hp?.trim()) {
    return NextResponse.json(
      { error: "İstek doğrulanamadı. Sayfayı yenileyip tekrar deneyin." },
      { status: 400 },
    );
  }

  const to = getSupportInboxEmail();
  if (!to) {
    return NextResponse.json(
      {
        error:
          "Destek gelen kutusu yapılandırılmamış. NEXT_PUBLIC_SUPPORT_EMAIL tanımlayın.",
      },
      { status: 503 },
    );
  }

  const sent = await sendSupportContactEmail({ to, ...fields });
  if (!sent.ok) {
    return NextResponse.json(
      {
        error: sent.message,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
