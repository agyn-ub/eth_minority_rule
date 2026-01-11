import { Address } from 'viem';
import MinorityRuleGameABI from './MinorityRuleGame.json';

export const CONTRACTS = {
  31337: {
    // Anvil (local)
    MinorityRuleGame: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ANVIL ||
      '0x5FbDB2315678afecb367f032d93F642f64180aa3') as Address,
  },
  84532: {
    // Base Sepolia
    MinorityRuleGame: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE_SEPOLIA || '') as Address,
  },
  8453: {
    // Base Mainnet
    MinorityRuleGame: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE || '') as Address,
  },
} as const;

export const MinorityRuleGameAbi = MinorityRuleGameABI;

// Helper to get contract address for current chain
export function getContractAddress(chainId: number): Address {
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS];
  if (!contracts) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return contracts.MinorityRuleGame;
}
