/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    // In dev, skip `/_next/image` proxy — Node's fetch to cdn.burrow.in often hits
    // ERR_SSL_TLSV1_UNRECOGNIZED_NAME (SNI/cert) while the browser loads the same URL fine.
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.burrow.in', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    ],
  },
};

export default nextConfig;
