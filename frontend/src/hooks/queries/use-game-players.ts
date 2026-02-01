import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_GAME_PLAYERS } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';
import { POLLING_INTERVALS, COMMON_QUERY_OPTIONS } from '@/lib/polling-config';

export interface GraphQLPlayer {
  game_id: string;
  player_address: string;
  joined_amount: string;
  joined_at: string;
  block_number: string;
  transaction_hash: string;
}

/**
 * Hook for fetching players in a game
 *
 * ## No Independent Polling
 * This query relies on cache invalidation from the main useGame query.
 * When WebSocket or useGame polling detects changes, this refetches automatically.
 * Also refetches on window focus for manual refresh.
 */
export function useGamePlayers(
  gameId: number | string | undefined,
  options?: {
    enabled?: boolean;
    gameState?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.games.players(gameId!),
    queryFn: async () => {
      const data = await graphqlRequest<{ playerss: { items: GraphQLPlayer[] } }>(GET_GAME_PLAYERS, {
        gameId: String(gameId),
      });
      return data.playerss.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - relies on cache invalidation
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    placeholderData: (previousData) => previousData,
  });
}
