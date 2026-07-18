import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Action 请求体默认上限是 1MB，后台图片上传（商品图/Banner/Logo等）
  // 随便一张图就能超过，导致整个页面报 500 崩掉。调大到 4MB
  // （Vercel Serverless Function 本身的请求体硬上限约 4.5MB，不能再往上调了）。
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mhrktitzwxovldbykeur.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
