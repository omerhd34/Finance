import { NextResponse } from "next/server";
import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { blockIfEmailNotVerified } from "@/lib/require-email-verified";
import { ensurePremiumNotExpired } from "@/lib/premium-subscription";
import { prisma } from "@/lib/prisma";
import { scanReceiptImageWithGemini } from "@/lib/receipt-ocr";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const emailBlock = blockIfEmailNotVerified(session);
    if (emailBlock) return emailBlock;

    await ensurePremiumNotExpired(session.user.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planTier: true },
    });
    if (!dbUser || dbUser.planTier !== "premium") {
      return NextResponse.json(
        {
          error:
            "Fiş ve fatura tarama yalnızca Premium plandadır. Ayarlar üzerinden planınızı yükseltebilirsiniz.",
        },
        { status: 403 },
      );
    }

    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "multipart/form-data ile dosya gönderin" },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "file alanı gerekli" },
        { status: 400 },
      );
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Dosya boş olamaz ve en fazla 4 MB olabilir" },
        { status: 400 },
      );
    }
    const mime = (file.type || "application/octet-stream").toLowerCase();
    if (!ALLOWED.has(mime)) {
      return NextResponse.json(
        { error: "Yalnızca JPEG, PNG veya WebP yükleyin" },
        { status: 400 },
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        {
          error: "AI yapılandırması eksik. GEMINI_API_KEY tanımlı olmalıdır.",
        },
        { status: 503 },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = buf.toString("base64");
    const parsed = await scanReceiptImageWithGemini(geminiKey, b64, mime);

    return NextResponse.json({
      type: parsed.type,
      amountTry: parsed.amountTry,
      category: parsed.category,
      description: parsed.description ?? null,
      date: parsed.date,
    });
  } catch (e) {
    console.error(e);
    const errMsg = e instanceof Error ? e.message : String(e);
    const fetchErr = e instanceof GoogleGenerativeAIFetchError ? e : null;
    const looksLikeQuota =
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.toLowerCase().includes("quota") ||
      errMsg.includes("429");
    if (looksLikeQuota || fetchErr?.status === 429) {
      return NextResponse.json(
        {
          error:
            "Şu an AI kotası veya istek limiti nedeniyle tarama yapılamadı. Bir süre sonra tekrar deneyin.",
        },
        { status: 429 },
      );
    }
    if (fetchErr?.status === 503 || errMsg.includes("503")) {
      return NextResponse.json(
        {
          error:
            "AI servisi geçici olarak yoğun. Lütfen daha sonra tekrar deneyin.",
        },
        { status: 503 },
      );
    }
    if (e instanceof GoogleGenerativeAIFetchError && e.status === 404) {
      return NextResponse.json(
        {
          error:
            "Yapılandırılmış Gemini modeli kullanılamıyor. GEMINI_MODEL ortam değişkenini güncelleyin.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Fiş okunamadı. Daha net bir fotoğraf deneyin." },
      { status: 500 },
    );
  }
}
