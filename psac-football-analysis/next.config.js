/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static exports
  output: 'standalone',
  // Configure headers for CORS
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Configure rewrites to proxy requests to Flask server
  async rewrites() {
    return [
      {
        source: '/api/detect',
        destination: `${process.env.NEXT_PUBLIC_FLASK_SERVER_URL}/detect`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_FLASK_SERVER_URL}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig; 