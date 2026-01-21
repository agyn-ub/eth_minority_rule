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
    refetchInterval: (query) => {
      // If querying current round during RevealPhase, poll aggressively
      if (options?.gameState && round === options.currentRound && options.gameState === 'RevealPhase') {
        return 4_000; // 4 seconds - votes being revealed
      }
      // Historical rounds don't need frequent polling
      return 30_000; // 30 seconds - default for all other cases
    },
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
    refetchInterval: (query) => {
      // If querying current round during CommitPhase, poll aggressively
      if (options?.gameState && round === options.currentRound && options.gameState === 'CommitPhase') {
        return 4_000; // 4 seconds - commits being submitted
      }
      // Historical rounds don't need frequent polling
      return 30_000; // 30 seconds - default for all other cases
    },
    placeholderData: (previousData) => previousData,
  });
}
