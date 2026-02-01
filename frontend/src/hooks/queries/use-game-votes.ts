import { useQuery } from '@tanstack/react-query';
import { getGameVotes, getGameCommits } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { POLLING_INTERVALS, COMMON_QUERY_OPTIONS } from '@/lib/polling-config';

/**
 * Hook for fetching votes
 *
 * ## Smart Polling Strategy
 * - **RevealPhase**: Poll actively (votes are being revealed)
 * - **Other phases**: Stop polling (votes are hidden or locked)
 *
 * Votes are only revealed during RevealPhase, so polling in other
 * phases wastes bandwidth.
 */
export function useGameVotes(
  gameId: number | string | undefined,
  round?: number,
  options?: { enabled?: boolean; gameState?: string; currentRound?: number }
) {
  // Only poll if we're in RevealPhase
  const shouldPoll = options?.gameState === 'RevealPhase';

  return useQuery({
    queryKey: queryKeys.games.votes(gameId!, round),
    queryFn: () => getGameVotes(gameId!, round),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: shouldPoll ? POLLING_INTERVALS.votes.interval : false,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching commits
 *
 * ## Smart Polling Strategy
 * - **CommitPhase**: Poll actively (players are committing)
 * - **Other phases**: Stop polling (commits are locked)
 *
 * Commits only change during CommitPhase. Once RevealPhase starts,
 * commits are locked and cannot change.
 */
export function useGameCommits(
  gameId: number | string | undefined,
  round?: number,
  options?: { enabled?: boolean; gameState?: string; currentRound?: number }
) {
  // Only poll if we're in CommitPhase
  const shouldPoll = options?.gameState === 'CommitPhase';

  return useQuery({
    queryKey: queryKeys.games.commits(gameId!, round),
    queryFn: () => getGameCommits(gameId!, round),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: shouldPoll ? POLLING_INTERVALS.commits.interval : false,
    ...COMMON_QUERY_OPTIONS,
  });
}
