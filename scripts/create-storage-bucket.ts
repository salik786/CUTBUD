// One-off setup script: creates the public Supabase Storage bucket used for
// admin-uploaded style images. Safe to re-run — no-ops if it already exists.
import { supabaseAdmin, STYLE_IMAGES_BUCKET } from "../src/lib/supabaseAdmin";

async function main() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (buckets?.some((b) => b.name === STYLE_IMAGES_BUCKET)) {
    console.log(`Bucket "${STYLE_IMAGES_BUCKET}" already exists.`);
    return;
  }

  const { error } = await supabaseAdmin.storage.createBucket(STYLE_IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: "10MB",
  });
  if (error) throw error;
  console.log(`Created bucket "${STYLE_IMAGES_BUCKET}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
