import { useQuery } from '@tanstack/react-query';
import { getGameEliminations } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching elimination records for a game
 * Polls every 5 seconds to catch new eliminations
 */
export function useGameEliminations(
  gameId: number | string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.games.eliminations(gameId!),
    queryFn: () => getGameEliminations(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: 5_000, // Poll every 5 seconds
    placeholderData: (previousData) => previousData,
  });
}
