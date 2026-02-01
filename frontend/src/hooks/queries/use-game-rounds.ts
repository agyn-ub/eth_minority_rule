import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_GAME_ROUNDS, GET_GAME_WINNERS } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';

export interface GraphQLRound {
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

export interface GraphQLWinner {
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
 * ## No Independent Polling
 * This query relies on cache invalidation from the main useGame query.
 * When WebSocket or useGame polling detects changes, this refetches automatically.
 */
export function useGameRounds(
  gameId: number | string | undefined,
  options?: {
    enabled?: boolean;
    gameState?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.games.rounds(gameId!),
    queryFn: async () => {
      const data = await graphqlRequest<{ roundss: { items: GraphQLRound[] } }>(GET_GAME_ROUNDS, {
        gameId: String(gameId),
      });
      return data.roundss.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - relies on cache invalidation
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching game winners
 *
 * ## No Independent Polling
 * Winners are static once set - they never change.
 * Relies on cache invalidation from useGame query.
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
    queryFn: async () => {
      const data = await graphqlRequest<{ winnerss: { items: GraphQLWinner[] } }>(GET_GAME_WINNERS, {
        gameId: String(gameId),
      });
      return data.winnerss.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - static historical data
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}
