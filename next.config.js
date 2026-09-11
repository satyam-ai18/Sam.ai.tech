/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mkconvent.com',
      },
      {
        protocol: 'https',
        hostname: 'mkconvent.com',
      },
      {
        protocol: 'https',
        hostname: 'demo.smart-school.in',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Required for Vercel deployment
  output: undefined, // 'standalone' if you need Docker; leave undefined for Vercel
  async redirects() {
    return [
      {
        source: '/admission/status',
        destination: '/admissions/status',
        permanent: true,
      },
      {
        source: '/admission/apply',
        destination: '/admissions/apply',
        permanent: true,
      },
      {
        source: '/admission',
        destination: '/admissions',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
