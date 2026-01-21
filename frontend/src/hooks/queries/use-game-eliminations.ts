import { useQuery } from '@tanstack/react-query';
import { getGameEliminations } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { getPollingInterval, getStaleTime, type GameState } from '@/lib/polling-strategies';

/**
 * Hook for fetching elimination records for a game
 * Uses adaptive polling based on game state:
 * - Active phases: 10s (eliminations immutable after creation)
 * - Completed: No polling (static data)
 */
export function useGameEliminations(
  gameId: number | string | undefined,
  options?: { enabled?: boolean; gameState?: string }
) {
  const pollingInterval = getPollingInterval(options?.gameState as GameState, 'static');

  return useQuery({
    queryKey: queryKeys.games.eliminations(gameId!),
    queryFn: () => getGameEliminations(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: pollingInterval,
    staleTime: getStaleTime(pollingInterval),
    placeholderData: (previousData) => previousData,
  });
}
