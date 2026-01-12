import { useQuery } from '@tanstack/react-query';
import { getGameRounds, getGameWinners } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching round history
 * Polls every 5 seconds to catch new completed rounds
 */
export function useGameRounds(gameId: number | string | undefined, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.games.rounds(gameId!),
    queryFn: () => getGameRounds(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: 5_000, // 5 seconds
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching game winners
 * Polls every 10 seconds (only relevant for completed games)
 */
export function useGameWinners(gameId: number | string | undefined, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.games.winners(gameId!),
    queryFn: () => getGameWinners(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: 10_000, // 10 seconds
    placeholderData: (previousData) => previousData,
  });
}
