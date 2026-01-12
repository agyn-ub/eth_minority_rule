import { useQuery } from '@tanstack/react-query';
import { getGameVotes, getGameCommits } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { useGame } from './use-game';

/**
 * Hook for fetching votes
 * Adaptive polling based on game state and round
 */
export function useGameVotes(
  gameId: number | string | undefined,
  round?: number,
  options?: { enabled?: boolean }
) {
  const { data: game } = useGame(gameId);

  return useQuery({
    queryKey: queryKeys.games.votes(gameId!, round),
    queryFn: () => getGameVotes(gameId!, round),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: (query) => {
      // If querying current round during RevealPhase, poll aggressively
      if (game && round === game.currentRound && game.state === 'RevealPhase') {
        return 2_000; // 2 seconds - votes being revealed
      }
      // Historical rounds don't need frequent polling
      return 30_000; // 30 seconds
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
  options?: { enabled?: boolean }
) {
  const { data: game } = useGame(gameId);

  return useQuery({
    queryKey: queryKeys.games.commits(gameId!, round),
    queryFn: () => getGameCommits(gameId!, round),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: (query) => {
      // If querying current round during CommitPhase, poll aggressively
      if (game && round === game.currentRound && game.state === 'CommitPhase') {
        return 2_000; // 2 seconds - commits being submitted
      }
      // Historical rounds don't need frequent polling
      return 30_000; // 30 seconds
    },
    placeholderData: (previousData) => previousData,
  });
}
