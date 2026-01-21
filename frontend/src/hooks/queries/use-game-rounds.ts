import { useQuery } from '@tanstack/react-query';
import { getGameRounds, getGameWinners } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { getPollingInterval, getStaleTime, type GameState } from '@/lib/polling-strategies';

/**
 * Hook for fetching round history
 * Uses adaptive polling based on game state:
 * - Active phases: 10s (rounds immutable after creation)
 * - Completed: No polling (static data)
 */
export function useGameRounds(gameId: number | string | undefined, options?: {
  enabled?: boolean;
  gameState?: string;
}) {
  const pollingInterval = getPollingInterval(options?.gameState as GameState, 'static');

  return useQuery({
    queryKey: queryKeys.games.rounds(gameId!),
    queryFn: () => getGameRounds(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: pollingInterval,
    staleTime: getStaleTime(pollingInterval),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching game winners
 * Uses adaptive polling based on game state:
 * - Completed: No polling (winners don't change)
 * - Active: 10s (checking for new winners)
 */
export function useGameWinners(gameId: number | string | undefined, options?: {
  enabled?: boolean;
  gameState?: string;
}) {
  const pollingInterval = getPollingInterval(options?.gameState as GameState, 'static');

  return useQuery({
    queryKey: queryKeys.games.winners(gameId!),
    queryFn: () => getGameWinners(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: pollingInterval,
    staleTime: getStaleTime(pollingInterval),
    placeholderData: (previousData) => previousData,
  });
}
