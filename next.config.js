const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io', pathname: '/**' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
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
      {
        source: '/:locale/login',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' }],
      },
      {
        source: '/:locale/register',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' }],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
