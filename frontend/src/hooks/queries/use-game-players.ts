import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_GAME_PLAYERS } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';
import { POLLING_INTERVALS, COMMON_QUERY_OPTIONS } from '@/lib/polling-config';

interface Player {
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
 * ## Smart Polling Strategy
 * - **ZeroPhase**: Poll actively (players can still join)
 * - **CommitPhase+**: Stop polling (player list is locked after round starts)
 *
 * This optimization prevents unnecessary network requests since the player
 * list cannot change once the game moves past ZeroPhase.
 */
export function useGamePlayers(
  gameId: number | string | undefined,
  options?: {
    enabled?: boolean;
    gameState?: string;
  }
) {
  // Only poll if we're in ZeroPhase
  const shouldPoll = options?.gameState === 'ZeroPhase';

  return useQuery({
    queryKey: queryKeys.games.players(gameId!),
    queryFn: async () => {
      const data = await graphqlRequest<{ playerss: { items: Player[] } }>(GET_GAME_PLAYERS, {
        gameId: String(gameId),
      });
      return data.playerss.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: shouldPoll ? POLLING_INTERVALS.players.interval : false,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}
