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

interface GamesResponse {
  gamess: { items: Game[] };
}

interface PlayersResponse {
  playerss: { items: Player[] };
}

interface VotesResponse {
  votess: { items: Vote[] };
}

interface RoundsResponse {
  roundss: { items: Round[] };
}

interface WinnersResponse {
  winnerss: { items: Winner[] };
}

export function useBatchPlayerGameDetails(
  playerAddress: string,
  gameIds: string[]
) {
  return useQuery<BatchPlayerGameDetail[]>({
    queryKey: queryKeys.players.batchGameDetails(playerAddress, gameIds),
    queryFn: async () => {
      if (gameIds.length === 0) return [];

      const normalizedAddress = playerAddress.toLowerCase();

      // 5 parallel GraphQL queries (mirrors the old Supabase approach)
      const [gamesData, playersData, votesData, roundsData, winnersData] = await Promise.all([
        graphqlRequest<GamesResponse>(GET_GAMES_BY_IDS, { gameIds }),
        graphqlRequest<PlayersResponse>(GET_PLAYER_GAMES, {
          playerAddress: normalizedAddress,
        }),
        graphqlRequest<VotesResponse>(GET_PLAYER_VOTES_FOR_GAMES, {
          playerAddress: normalizedAddress,
          gameIds,
        }),
        graphqlRequest<RoundsResponse>(GET_ROUNDS_FOR_GAMES, { gameIds }),
        graphqlRequest<WinnersResponse>(GET_PLAYER_WINS_FOR_GAMES, {
          playerAddress: normalizedAddress,
          gameIds,
        }),
      ]);

      const games = gamesData.gamess.items;
      const playerInfos = playersData.playerss.items;
      const votes = votesData.votess.items;
      const rounds = roundsData.roundss.items;
      const winners = winnersData.winnerss.items;

      return gameIds
        .map((gameId) => {
          const game = games.find((g) => g.game_id === gameId);
          const playerInfo = playerInfos.find((p) => p.game_id === gameId);
          const gameVotes = votes.filter((v) => v.game_id === gameId);
          const gameRounds = rounds.filter((r) => r.game_id === gameId);
          const winnerInfo = winners.find((w) => w.game_id === gameId);

          return {
            game_id: gameId,
            game: game!,
            player_info: playerInfo!,
            votes: gameVotes,
            rounds: gameRounds,
            is_winner: !!winnerInfo,
            prize_amount: winnerInfo?.prize_amount,
          };
        })
        .filter((d) => d.game && d.player_info);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress && gameIds.length > 0,
  });
}
