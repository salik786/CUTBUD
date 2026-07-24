import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Lets the client-side Router Cache reuse a dynamic route's RSC payload
    // for this many seconds — navigating back to a cut card or the
    // recommendations grid you already visited skips the server round-trip
    // instead of refetching every time.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    // Next 16 requires every `quality` value passed to next/image to be
    // declared here — PhotoPlaceholder defaults to 90 (sharper than the
    // framework default of 75) for style/hero photos.
    qualities: [75, 90],
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
