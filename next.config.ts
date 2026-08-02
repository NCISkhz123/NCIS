import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
    optimizePackageImports: ["lucide-react", "@base-ui/react", "date-fns"],
  },
};

export default nextConfig;
