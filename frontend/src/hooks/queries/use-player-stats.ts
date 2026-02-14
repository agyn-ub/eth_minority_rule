import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_PLAYER_GAMES, GET_PLAYER_WINS } from '@/lib/graphql/queries';
import type { PlayerStats, Player, Winner } from '@/lib/supabase';

interface PlayerGamesResponse {
  playerss: {
    items: Player[];
  };
}

interface PlayerWinsResponse {
  winnerss: {
    items: Winner[];
  };
}

/**
 * Hook to fetch player statistics overview via Ponder GraphQL
 * @param playerAddress - The player's wallet address
 * @returns Query result with player stats
 */
export function usePlayerStats(playerAddress: string) {
  return useQuery<PlayerStats | null>({
    queryKey: queryKeys.players.stats(playerAddress),
    queryFn: async () => {
      const normalizedAddress = playerAddress.toLowerCase();

      const [gamesData, winsData] = await Promise.all([
        graphqlRequest<PlayerGamesResponse>(GET_PLAYER_GAMES, {
          playerAddress: normalizedAddress,
        }),
        graphqlRequest<PlayerWinsResponse>(GET_PLAYER_WINS, {
          playerAddress: normalizedAddress,
        }),
      ]);

      const games = gamesData.playerss.items;
      const wins = winsData.winnerss.items;

      if (games.length === 0) {
        return null;
      }

      const totalPrizeAmount = wins.reduce((sum, win) => {
        return sum + BigInt(win.prize_amount);
      }, BigInt(0));

      const winRate = games.length > 0 ? (wins.length / games.length) * 100 : 0;

      return {
        player_address: normalizedAddress,
        total_games: games.length,
        total_wins: wins.length,
        total_prize_amount: totalPrizeAmount.toString(),
        win_rate: winRate,
        games_participated: games,
      };
    },
    refetchInterval: 30_000,
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress,
  });
}
