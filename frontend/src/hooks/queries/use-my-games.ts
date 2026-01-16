'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getMyGames } from '@/lib/supabase';

export function useMyGames() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['my-games', address?.toLowerCase()],
    queryFn: () => {
      if (!address) throw new Error('Not connected');
      return getMyGames(address);
    },
    enabled: !!address,
    refetchInterval: 5000, // Poll every 5s for updates
  });
}
