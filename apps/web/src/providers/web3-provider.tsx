"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { injected } from "@wagmi/core";
import { arbitrum, mainnet, polygon } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";

const connectors = [injected({ shimDisconnect: true })];

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http()
  },
  ssr: true
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
