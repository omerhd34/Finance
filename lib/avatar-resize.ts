const MAX_FILE_BYTES = 5 * 1024 * 1024;
const OUTPUT_SIDE = 256;
const JPEG_QUALITY = 0.82;

const ACCEPT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateAvatarFile(file: File): string | null {
  if (!ACCEPT_TYPES.has(file.type)) {
    return "Yalnızca JPEG, PNG veya WebP yükleyebilirsiniz.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "Dosya en fazla 5 MB olabilir.";
  }
  return null;
}

export async function fileToAvatarDataUrl(file: File): Promise<string> {
  const err = validateAvatarFile(file);
  if (err) throw new Error(err);

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIDE;
    canvas.height = OUTPUT_SIDE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tarayıcı canvas desteklemiyor.");

    const scale = Math.max(
      OUTPUT_SIDE / bitmap.width,
      OUTPUT_SIDE / bitmap.height,
    );
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    const x = (OUTPUT_SIDE - w) / 2;
    const y = (OUTPUT_SIDE - h) / 2;
    ctx.drawImage(bitmap, x, y, w, h);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
