'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';

export function NetworkWarningBanner() {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const supported = [31337, 84532, 8453];
  if (!isConnected || !chainId || supported.includes(chainId)) return null;

  return (
    <div className="bg-destructive/10 border-b border-destructive/30 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          Wrong network (Chain {chainId}). Switch to: Anvil (31337), Base Sepolia (84532), or Base (8453)
        </p>
        <Button onClick={() => switchChain({ chainId: 31337 })} size="sm">
          Switch to Anvil
        </Button>
      </div>
    </div>
  );
}
