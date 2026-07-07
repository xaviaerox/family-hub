/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "vrdurepiazvavuvmeoth.supabase.co";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Images ────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ── Security headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent click-jacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Force HTTPS for 1 year (only meaningful in production)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Block cross-origin resource sharing by default
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Referrer policy: send origin only for same-site requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy: disable unused browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
