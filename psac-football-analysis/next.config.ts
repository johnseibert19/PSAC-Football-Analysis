import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  //output: 'export',
  //distDir: 'dist',
  trailingSlash: true,
  assetPrefix: process.env.ELECTRON === 'true' ? './' : '/',
  api: {
    bodyParser: {
      sizeLimit: '1gb',
    },
    responseLimit: '1gb',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb', // Adjust as needed
    },
  },
};

export default nextConfig;
