import { useQuery } from '@tanstack/react-query';
import { getGamePlayers } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { getPollingInterval, getStaleTime, type GameState } from '@/lib/polling-strategies';

/**
 * Hook for fetching players in a game
 * Uses adaptive polling based on game state:
 * - ZeroPhase: 3s (players can join)
 * - CommitPhase/RevealPhase: 10s (players don't change during rounds)
 * - Completed: No polling (static data)
 */
export function useGamePlayers(gameId: number | string | undefined, options?: {
  enabled?: boolean;
  gameState?: string;
}) {
  const pollingInterval = getPollingInterval(options?.gameState as GameState, 'static');

  return useQuery({
    queryKey: queryKeys.games.players(gameId!),
    queryFn: () => getGamePlayers(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: pollingInterval,
    staleTime: getStaleTime(pollingInterval),
    placeholderData: (previousData) => previousData,
  });
}
