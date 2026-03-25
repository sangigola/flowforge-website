import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable API routes on Vercel
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
