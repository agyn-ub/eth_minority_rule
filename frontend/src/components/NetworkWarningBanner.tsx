'use client';

import { useAccount, useSwitchChain, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';

// Supported chains for this app
const SUPPORTED_CHAINS = [31337, 84532, 8453];

// Well-known chain IDs (supported + common networks)
// If a chainId isn't in this list, it's likely a stale/garbage value from an expired wallet session
const KNOWN_CHAIN_IDS = new Set([
  ...SUPPORTED_CHAINS,
  1,      // Ethereum Mainnet
  5,      // Goerli
  11155111, // Sepolia
  137,    // Polygon
  80001,  // Polygon Mumbai
  42161,  // Arbitrum One
  421613, // Arbitrum Goerli
  10,     // Optimism
  420,    // Optimism Goerli
  56,     // BNB Chain
  43114,  // Avalanche
  250,    // Fantom
  100,    // Gnosis
  42220,  // Celo
  1101,   // Polygon zkEVM
  324,    // zkSync Era
  59144,  // Linea
  534352, // Scroll
  8453,   // Base
  84531,  // Base Goerli
  84532,  // Base Sepolia
]);

export function NetworkWarningBanner() {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  if (!isConnected || !chainId || SUPPORTED_CHAINS.includes(chainId)) return null;

  const isStaleConnection = !KNOWN_CHAIN_IDS.has(chainId);

  if (isStaleConnection) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm">
            Wallet connection expired. Please reconnect.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => disconnect()} size="sm">
              Reconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-destructive/10 border-b border-destructive/30 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          Wrong network (Chain {chainId}). Switch to: Anvil (31337), Base Sepolia (84532), or Base (8453)
        </p>
        <div className="flex gap-2">
          <Button onClick={() => switchChain({ chainId: 31337 })} size="sm">
            Switch to Anvil
          </Button>
          <Button onClick={() => disconnect()} size="sm" variant="outline">
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
