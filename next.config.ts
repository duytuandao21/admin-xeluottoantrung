import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/danh-muc/cap-1', destination: '/san-pham/hang-xe', permanent: true },
      { source: '/danh-muc/cap-2', destination: '/san-pham/dong-xe', permanent: true },
    ];
  },
};

export default nextConfig;
