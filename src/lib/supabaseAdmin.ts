import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role secret key — full
 * access, bypasses Row Level Security. Never import this from client
 * components; it's only used for admin-panel image uploads today.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const STYLE_IMAGES_BUCKET = "style-images";
