/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // In newer versions, 'root' is often top-level under experimental 
    // or requires the specific 'turbopack' object to be structured differently
    turbopack: {
      root: '.',
    },
  },
};

export default nextConfig;