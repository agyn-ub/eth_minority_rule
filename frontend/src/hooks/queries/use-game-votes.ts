import { useQuery } from '@tanstack/react-query';
import { getGameVotes, getGameCommits } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching votes
 * Adaptive polling based on game state and round
 */
export function useGameVotes(
  gameId: number | string | undefined,
  round?: number,
  options?: { enabled?: boolean; gameState?: string; currentRound?: number }
) {
  return useQuery({
    queryKey: queryKeys.games.votes(gameId!, round),
    queryFn: () => getGameVotes(gameId!, round),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - rely on refetchOnWindowFocus
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching commits
 * Adaptive polling based on game state and round
 */
export function useGameCommits(
  gameId: number | string | undefined,
  round?: number,
  options?: { enabled?: boolean; gameState?: string; currentRound?: number }
) {
  return useQuery({
    queryKey: queryKeys.games.commits(gameId!, round),
    queryFn: () => getGameCommits(gameId!, round),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - rely on refetchOnWindowFocus
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}
