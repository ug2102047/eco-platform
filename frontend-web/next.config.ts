import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint অবজেক্টটি সম্পূর্ণ বাদ দেওয়া হয়েছে
};

export default nextConfig;