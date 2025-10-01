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
      // Force old /home route(s) to /releases on all devices
      {
        source: "/home",
        destination: "/releases",
        permanent: true,
      },
      {
        source: "/home/:path*",
        destination: "/releases",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
