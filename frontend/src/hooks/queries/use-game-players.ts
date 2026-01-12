import { useQuery } from '@tanstack/react-query';
import { getGamePlayers } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching players in a game
 * Polls every 5 seconds to catch new players joining
 */
export function useGamePlayers(gameId: number | string | undefined, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.games.players(gameId!),
    queryFn: () => getGamePlayers(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: 5_000, // 5 seconds
    placeholderData: (previousData) => previousData,
  });
}
