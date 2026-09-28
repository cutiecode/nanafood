import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getClientIp, logAdminAction, logError } from "@/lib/log";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type DetectedImageType = {
  mime: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

// Sniffs the file's actual binary signature ("magic bytes") instead of
// trusting the browser-supplied Content-Type, which an attacker fully
// controls. Only these three formats are ever accepted.
function detectImageType(buffer: Buffer): DetectedImageType | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", extension: "png" };
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { mime: "image/webp", extension: "webp" };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large. Maximum size is 5 MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large. Maximum size is 5 MB." }, { status: 400 });
    }

    const detected = detectImageType(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: "Unsupported file type. Only JPEG, PNG and WEBP images are allowed." },
        { status: 400 }
      );
    }

    // The original filename is never used to build the destination path —
    // only this generated name, run through path.basename() as a last
    // defense, ever reaches the filesystem.
    const generatedName = path.basename(`${crypto.randomUUID()}.${detected.extension}`);
    const filepath = path.join(process.cwd(), "public/dishes", generatedName);

    await writeFile(filepath, buffer);

    await logAdminAction({
      action: "upload.create",
      entityId: generatedName,
      ip: getClientIp(req),
      detail: `${detected.mime}, ${buffer.length} bytes`,
    });

    return NextResponse.json({ url: `/dishes/${generatedName}` });
  } catch (error) {
    console.error("Upload error:", error);
    await logError({ route: "POST /api/upload", error });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
