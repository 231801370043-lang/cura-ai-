/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
