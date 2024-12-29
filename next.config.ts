import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['127.0.0.1', 'localhost'], // 添加允许加载图片的域名
  },
};

export default nextConfig;
