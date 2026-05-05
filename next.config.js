/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io', pathname: '/**' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // Google Identity Services uses a popup/postMessage; strict COOP breaks the flow in some browsers.
  async headers() {
    return [
      {
        source: '/login',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' }],
      },
      {
        source: '/register',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' }],
      },
    ];
  },
  // Prevent stale webpack cache errors (Cannot find module './638.js', page_client-reference-manifest)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
