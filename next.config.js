const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 使用 domains 配置（简单方式）
    domains: ['dreamazebook.com', 'api.dreamazebook.com', '54.196.149.18', 'pub-276765949af547aba1ca5c576f2859ea.r2.dev', 'www.facebook.com', 'pro-s3-dre01.s3.amazonaws.com', 'example.com'],
    // 同时保留 remotePatterns 配置（更详细的控制）
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '54.196.149.18',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-276765949af547aba1ca5c576f2859ea.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dreamazebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dreamazebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig); 