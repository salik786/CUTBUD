import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAdminUser } from "@/lib/adminAuth";
import { supabaseAdmin, STYLE_IMAGES_BUCKET } from "@/lib/supabaseAdmin";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB, matches the bucket's own limit
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPEG, or WebP images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 10MB" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${nanoid()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(STYLE_IMAGES_BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(STYLE_IMAGES_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
