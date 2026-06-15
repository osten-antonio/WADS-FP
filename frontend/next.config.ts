import type { NextConfig } from "next";

const backendProtocol = process.env.BACKEND_PROTOCOL ?? "http";
const backendHostname = process.env.BACKEND_HOSTNAME ?? "localhost";
const backendPort = process.env.BACKEND_PORT ?? "8000";
const backendUrl = `${backendProtocol}://${backendHostname}:${backendPort}`;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/docs",
        destination: `${backendUrl}/docs`,
      },
      {
        source: "/api/docs/:path*",
        destination: `${backendUrl}/docs/:path*`,
      },
    ];
  },
};

export default nextConfig;
