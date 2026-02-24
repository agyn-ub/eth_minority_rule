import { http, createConfig } from 'wagmi';
import { base, baseSepolia, foundry } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const includeAnvil = !!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ANVIL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transports: Record<number, any> = {
  [baseSepolia.id]: http(),
  [base.id]: http(),
};

if (includeAnvil) {
  transports[foundry.id] = http('http://127.0.0.1:8545');
}

export const config = createConfig({
  chains: includeAnvil ? [foundry, baseSepolia, base] : [baseSepolia, base],
  connectors: [
    injected(), // MetaMask and other browser wallets
  ],
  transports,
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
