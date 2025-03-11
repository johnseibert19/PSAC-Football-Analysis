import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  //output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  assetPrefix: '.'
};

export default nextConfig;
