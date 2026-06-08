import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";

const monorepoRoot = path.resolve(process.cwd(), "..");
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {
  transpilePackages: ["@legabit/ui", "@legabit/api"],
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
