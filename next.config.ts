import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      // Allow S3 bucket domains
      's3.amazonaws.com',
      // Allow any subdomain of s3.amazonaws.com
      '*.s3.amazonaws.com',
      `${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com`
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        pathname: '**',
      },
    ],
    unoptimized: true,
  }
};

export default nextConfig;

