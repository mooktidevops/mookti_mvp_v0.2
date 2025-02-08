/** @type {import('next').NextConfig} */
const nextConfig = {
  //experimental: {
  //  ppr: true,
  //},
  images: {
    // Explicitly whitelist the domains for external images
    domains: [
      'avatar.vercel.sh',
      'avatars.githubusercontent.com',
      'public.blob.vercel-storage.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        // Note: Wildcard patterns might not work as expected in some Next.js versions.
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;