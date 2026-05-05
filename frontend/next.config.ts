import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "dnva.me",
      },
      {
        protocol: "https",
        hostname: "static.domainesia.com",
      },
    ],
  },
};

export default nextConfig;
