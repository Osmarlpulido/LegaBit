"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const connectorLabels: Record<string, string> = {
    injected: "MetaMask",
    metaMask: "MetaMask",
    walletConnect: "WalletConnect",
    coinbaseWallet: "Coinbase Wallet"
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 rounded-lg border border-legabit-gold/50 bg-legabit-gold/10 px-3 py-1.5 text-sm font-medium text-legabit-charcoal transition-colors hover:bg-legabit-gold/20"
          title={address}
          onClick={() => setOpen(false)}
        >
          <span className="h-2 w-2 rounded-full bg-legabit-gold" />
          {shortenAddress(address)}
        </button>
        <button
          onClick={() => disconnect()}
          className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-legabit-charcoal"
          title="Desconectar wallet"
        >
          ✕
        </button>
      </div>
    );
  }

  if (isPending) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-lg border border-legabit-gold/40 bg-legabit-ivory px-3 py-1.5 text-sm font-medium text-legabit-charcoal opacity-70"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-legabit-gold" />
        Conectando…
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-legabit-petrol/30 bg-legabit-petrol px-3 py-1.5 text-sm font-medium text-legabit-ivory transition-colors hover:bg-legabit-petrol/85"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
        Conectar wallet
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-background shadow-lg">
          <p className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Elegir wallet
          </p>
          <ul className="p-1.5">
            {connectors.map((connector) => (
              <li key={connector.id}>
                <button
                  onClick={() => {
                    connect({ connector });
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-bold">
                    {(connectorLabels[connector.id] ?? connector.name).charAt(0)}
                  </span>
                  {connectorLabels[connector.id] ?? connector.name}
                </button>
              </li>
            ))}
            {connectors.length === 0 && (
              <li className="px-3 py-2.5 text-xs text-muted-foreground">
                Sin wallets detectadas. Instala MetaMask.
              </li>
            )}
          </ul>
          {error && (
            <p className="border-t border-border px-4 py-2 text-xs text-red-600">
              {error.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
