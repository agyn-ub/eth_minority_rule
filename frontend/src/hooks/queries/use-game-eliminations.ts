import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_GAME_ELIMINATIONS } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';

export interface GraphQLElimination {
  game_id: string;
  player_address: string;
  eliminated: boolean;
  eliminated_round: number | null;
}

/**
 * Hook for fetching eliminations in a game
 *
 * ## No Independent Polling
 * This query relies on cache invalidation from the main useGame query.
 * When WebSocket or useGame polling detects changes, this refetches automatically.
 * Also refetches on window focus for manual refresh.
 */
export function useGameEliminations(
  gameId: number | string | undefined,
  options?: {
    enabled?: boolean;
    gameState?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.games.eliminations(gameId!),
    queryFn: async () => {
      const data = await graphqlRequest<{ eliminationss: { items: GraphQLElimination[] } }>(GET_GAME_ELIMINATIONS, {
        gameId: String(gameId),
      });
      return data.eliminationss.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - relies on cache invalidation
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    placeholderData: (previousData) => previousData,
  });
}
