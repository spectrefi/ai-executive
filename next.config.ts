import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  serverExternalPackages: ["fluent-ffmpeg", "ffmpeg-static", "twitter-api-v2", "@runwayml/sdk"],
};

export default nextConfig;
