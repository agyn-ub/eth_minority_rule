import { http, createConfig } from 'wagmi';
import { base, baseSepolia, foundry } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [foundry, baseSepolia, base],
  connectors: [
    injected(), // MetaMask and other browser wallets
  ],
  transports: {
    [foundry.id]: http('http://127.0.0.1:8545'),
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
