import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getPlayerStats, getPlayerVotes, PlayerStats, Vote } from '@/lib/supabase';

/**
 * Hook to fetch player statistics overview
 * @param playerAddress - The player's wallet address
 * @returns Query result with player stats
 */
export function usePlayerStats(playerAddress: string) {
  return useQuery<PlayerStats | null>({
    queryKey: queryKeys.players.stats(playerAddress),
    queryFn: () => getPlayerStats(playerAddress),
    refetchInterval: 30_000, // Poll every 30 seconds
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress,
  });
}

/**
 * Hook to fetch all votes for a player across all games
 * @param playerAddress - The player's wallet address
 * @returns Query result with player votes
 */
export function usePlayerVotes(playerAddress: string) {
  return useQuery<Vote[]>({
    queryKey: queryKeys.players.votes(playerAddress),
    queryFn: () => getPlayerVotes(playerAddress),
    refetchInterval: 30_000, // Poll every 30 seconds
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress,
  });
}
