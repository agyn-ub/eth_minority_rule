import { useQuery } from '@tanstack/react-query';
import { getGameRounds, getGameWinners } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { POLLING_INTERVALS, COMMON_QUERY_OPTIONS } from '@/lib/polling-config';

/**
 * Hook for fetching round history
 *
 * ## Smart Polling Strategy
 * - **CommitPhase/RevealPhase**: Poll (rounds can be processed)
 * - **ZeroPhase/Completed**: Stop polling (no round changes)
 *
 * Rounds only change when a round is processed, which happens
 * during active game phases.
 */
export function useGameRounds(
  gameId: number | string | undefined,
  options?: {
    enabled?: boolean;
    gameState?: string;
  }
) {
  // Only poll during active game phases
  const shouldPoll = options?.gameState === 'CommitPhase' || options?.gameState === 'RevealPhase';

  return useQuery({
    queryKey: queryKeys.games.rounds(gameId!),
    queryFn: () => getGameRounds(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: shouldPoll ? POLLING_INTERVALS.rounds.interval : false,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching game winners
 *
 * ## Smart Polling Strategy
 * - **Never polls**: Winners are static once set
 * - Loads once on page load or window focus
 *
 * Winners are only set when a game completes and never change afterward.
 * Polling wastes bandwidth since this is historical data.
 */
export function useGameWinners(
  gameId: number | string | undefined,
  options?: {
    enabled?: boolean;
    gameState?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.games.winners(gameId!),
    queryFn: () => getGameWinners(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    // Never poll - winners are static historical data
    // Will still refetch on window focus (via COMMON_QUERY_OPTIONS)
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}
