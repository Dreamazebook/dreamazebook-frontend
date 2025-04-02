import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['127.0.0.1', 'localhost','pub-8cae259c4f3f4e73adf6a65ae6bbd7fa.r2.dev','www.facebook.com'], // 添加允许加载图片的域名
  },
};
 
export default withNextIntl(nextConfig);
