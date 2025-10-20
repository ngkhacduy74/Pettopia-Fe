import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/clinic/dashboard',
        destination: 'http://localhost:4000/clinic/dashboard'
      }
    ]
  }
};

export default nextConfig;
