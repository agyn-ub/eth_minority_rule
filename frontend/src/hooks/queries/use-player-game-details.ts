import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { graphqlRequest } from '@/lib/graphql/client';
import {
  GET_GAMES_BY_IDS,
  GET_PLAYER_GAMES,
  GET_PLAYER_VOTES_FOR_GAMES,
  GET_ROUNDS_FOR_GAMES,
  GET_PLAYER_WINS_FOR_GAMES,
} from '@/lib/graphql/queries';
import type { BatchPlayerGameDetail, Game, Player, Vote, Round, Winner } from '@/lib/supabase';

/**
 * @deprecated Use useBatchPlayerGameDetails instead for better performance
 * Fetches individual game detail for a player via Ponder GraphQL.
 */
export function usePlayerGameDetail(
  playerAddress: string,
  gameId: number | string
) {
  return useQuery<BatchPlayerGameDetail | null>({
    queryKey: queryKeys.players.gameDetail(playerAddress, gameId),
    queryFn: async () => {
      const normalizedAddress = playerAddress.toLowerCase();
      const gameIds = [String(gameId)];

      const [gamesData, playersData, votesData, roundsData, winnersData] = await Promise.all([
        graphqlRequest<{ gamess: { items: Game[] } }>(GET_GAMES_BY_IDS, { gameIds }),
        graphqlRequest<{ playerss: { items: Player[] } }>(GET_PLAYER_GAMES, {
          playerAddress: normalizedAddress,
        }),
        graphqlRequest<{ votess: { items: Vote[] } }>(GET_PLAYER_VOTES_FOR_GAMES, {
          playerAddress: normalizedAddress,
          gameIds,
        }),
        graphqlRequest<{ roundss: { items: Round[] } }>(GET_ROUNDS_FOR_GAMES, { gameIds }),
        graphqlRequest<{ winnerss: { items: Winner[] } }>(GET_PLAYER_WINS_FOR_GAMES, {
          playerAddress: normalizedAddress,
          gameIds,
        }),
      ]);

      const game = gamesData.gamess.items[0];
      const playerInfo = playersData.playerss.items.find(
        (p) => p.game_id === String(gameId)
      );

      if (!game || !playerInfo) return null;

      const winnerInfo = winnersData.winnerss.items[0];

      return {
        game_id: String(gameId),
        game,
        player_info: playerInfo,
        votes: votesData.votess.items,
        rounds: roundsData.roundss.items,
        is_winner: !!winnerInfo,
        prize_amount: winnerInfo?.prize_amount,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress && !!gameId,
  });
}
