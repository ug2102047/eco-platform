import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // এই লাইনটি নেক্সট জেএস-কে রেন্ডারের জন্য স্ট্যাটিক আউটপুট ফাইল তৈরি করতে বাধ্য করবে
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;