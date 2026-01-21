import { useQuery } from '@tanstack/react-query';
import { getGamePlayers, getGameCommits, getGameVotes, getGameEliminations } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching only current round data
 * Reduces data fetching by filtering commits/votes by round
 */
export function useCurrentRoundData(
  gameId: number | string | undefined,
  currentRound: number | undefined,
  options?: { pollingInterval?: number }
) {
  return useQuery({
    queryKey: queryKeys.games.currentRoundData(gameId!, currentRound!),
    queryFn: async () => {
      // Fetch only current round data in parallel
      const [players, commits, votes, eliminations] = await Promise.all([
        getGamePlayers(gameId!),
        getGameCommits(gameId!, currentRound), // Filter by round on backend
        getGameVotes(gameId!, currentRound),   // Filter by round on backend
        getGameEliminations(gameId!),          // Get elimination status
      ]);
      return { players, commits, votes, eliminations };
    },
    enabled: gameId !== undefined && currentRound !== undefined,
    refetchInterval: options?.pollingInterval ?? 10_000,
    staleTime: 8_000,
    placeholderData: (previousData) => previousData,
  });
}
