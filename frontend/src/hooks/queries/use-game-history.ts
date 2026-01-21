import { useQuery } from '@tanstack/react-query';
import { getGameRounds, getGameWinners, getGameEliminations, getGameVotes } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching game history (rounds, winners, eliminations, votes)
 * Only loads on-demand, not automatically
 */
export function useGameHistory(
  gameId: number | string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.games.history(gameId!),
    queryFn: async () => {
      // Fetch history data in parallel
      const [rounds, winners, eliminations, votes] = await Promise.all([
        getGameRounds(gameId!),
        getGameWinners(gameId!),
        getGameEliminations(gameId!),
        getGameVotes(gameId!), // Get all votes to show who won each round
      ]);
      return { rounds, winners, eliminations, votes };
    },
    enabled: gameId !== undefined && (options?.enabled !== false),
    staleTime: 60_000, // Cache for 1 minute (history doesn't change often)
  });
}
