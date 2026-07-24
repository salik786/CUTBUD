import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AI-generated style/hero photos are served as full-size (~4MB, 2048px)
    // originals from this CDN — letting next/image optimize them (resize +
    // re-encode to WebP/AVIF) instead of serving them raw is the single
    // biggest win for perceived load time on mobile.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d8j0ntlcm91z4.cloudfront.net",
      },
      {
        // Admin-uploaded style images, via Supabase Storage.
        protocol: "https",
        hostname: "tbxxwhebvrmfkygfjeug.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
