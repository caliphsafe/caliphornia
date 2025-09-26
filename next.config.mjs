/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      // Force old releases route(s) to /home on all devices
      {
        source: "/releases",
        destination: "/home",
        permanent: true,
      },
      {
        source: "/releases/:path*",
        destination: "/home",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
