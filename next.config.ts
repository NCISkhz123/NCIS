import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: ["lucide-react", "@base-ui/react", "date-fns"],
  },
};

export default nextConfig;
