import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_GAME_ROUNDS, GET_GAME_WINNERS } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';
import { POLLING_INTERVALS, COMMON_QUERY_OPTIONS } from '@/lib/polling-config';

interface Round {
  game_id: string;
  round: number;
  yes_count: number;
  no_count: number;
  minority_vote: boolean;
  remaining_players: number;
  completed_at: string;
  block_number: string;
  transaction_hash: string;
}

interface Winner {
  game_id: string;
  player_address: string;
  prize_amount: string;
  platform_fee: string;
  paid_at: string;
  block_number: string;
  transaction_hash: string;
}

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
    queryFn: async () => {
      const data = await graphqlRequest<{ roundss: { items: Round[] } }>(GET_GAME_ROUNDS, {
        gameId: String(gameId),
      });
      return data.roundss.items;
    },
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
  const shouldPoll = options?.gameState === 'Completed';

  return useQuery({
    queryKey: queryKeys.games.winners(gameId!),
    queryFn: async () => {
      const data = await graphqlRequest<{ winnerss: { items: Winner[] } }>(GET_GAME_WINNERS, {
        gameId: String(gameId),
      });
      return data.winnerss.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    // Never poll - winners are static historical data
    // Will still refetch on window focus (via COMMON_QUERY_OPTIONS)
    refetchInterval: shouldPoll ? POLLING_INTERVALS.votes.interval : false,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}
