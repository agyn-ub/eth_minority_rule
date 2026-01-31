import { useQuery } from '@tanstack/react-query';
import { getGamePlayers } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching players in a game
 * No polling - relies on refetchOnWindowFocus and manual invalidation
 */
export function useGamePlayers(gameId: number | string | undefined, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.games.players(gameId!),
    queryFn: () => getGamePlayers(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - rely on main game query + refetchOnWindowFocus
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}
