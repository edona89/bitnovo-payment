import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'payments.pre-bnvo.com',
      },
      {
        protocol: 'https',
        hostname: 'metamask.io',
      },
    ],
  },
};

export default nextConfig;
