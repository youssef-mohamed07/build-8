import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(safeName, buffer, { contentType: file.type, upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl, size: file.size, mimeType: file.type });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeName), buffer);
  return NextResponse.json({
    url: `/uploads/${safeName}`,
    size: file.size,
    mimeType: file.type,
  });
}
