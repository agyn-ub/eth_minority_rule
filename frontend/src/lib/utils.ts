import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther, parseEther } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatWei(wei: string | bigint): string {
  try {
    const value = typeof wei === 'string' ? BigInt(wei) : wei;
    return formatEther(value);
  } catch {
    return '0';
  }
}

export function parseEth(eth: string): bigint {
  try {
    return parseEther(eth);
  } catch {
    return 0n;
  }
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

export function getTimeRemaining(deadline: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = deadline - now;

  if (remaining <= 0) return 'Expired';

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getGameStateLabel(state: string): string {
  switch (state) {
    case 'ZeroPhase':
      return 'Waiting to Start';
    case 'CommitPhase':
      return 'Commit Phase';
    case 'RevealPhase':
      return 'Reveal Phase';
    case 'Completed':
      return 'Completed';
    default:
      return state;
  }
}

export function getGameStateColor(state: string): string {
  switch (state) {
    case 'ZeroPhase':
      return 'bg-gray-500';
    case 'CommitPhase':
      return 'bg-blue-500';
    case 'RevealPhase':
      return 'bg-yellow-500';
    case 'Completed':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}
