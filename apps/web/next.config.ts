import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";

const monorepoRoot = path.resolve(process.cwd(), "..");
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {
  transpilePackages: ["@legabit/ui", "@legabit/api-contracts"],
  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL?.trim() ?? "http://localhost:4000";
    return [
      { source: "/api/auth/:path*", destination: `${apiUrl}/api/auth/:path*` },
      { source: "/api/v1/:path*", destination: `${apiUrl}/api/v1/:path*` }
    ];
  },
  webpack(config) {
    // @walletconnect/modal-ui arrastra motion/@motionone/dom con archivos rotos.
    // Sustituimos esos paquetes con módulos vacíos para que el build no falle.
    // El conector injected (MetaMask) no depende de ellos y sigue funcionando.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@walletconnect/modal-ui": false,
      "@walletconnect/modal": false
    };
    return config;
  }
};

export default nextConfig;
