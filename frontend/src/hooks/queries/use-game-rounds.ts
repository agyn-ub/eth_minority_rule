import { useQuery } from '@tanstack/react-query';
import { getGameRounds, getGameWinners } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching round history
 * No polling - relies on refetchOnWindowFocus and manual invalidation
 */
export function useGameRounds(gameId: number | string | undefined, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.games.rounds(gameId!),
    queryFn: () => getGameRounds(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching game winners
 * No polling - only relevant for completed games (static data)
 */
export function useGameWinners(gameId: number | string | undefined, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.games.winners(gameId!),
    queryFn: () => getGameWinners(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling for static winner data
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}
