import { useQuery } from '@tanstack/react-query';
import { getGameEliminations } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching elimination records for a game
 * No polling - relies on refetchOnWindowFocus and manual invalidation
 */
export function useGameEliminations(
  gameId: number | string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.games.eliminations(gameId!),
    queryFn: () => getGameEliminations(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}
