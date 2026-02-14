import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_ALL_PLAYERS, GET_ALL_WINNERS } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';
import { CACHE_TIMES, COMMON_QUERY_OPTIONS } from '@/lib/polling-config';

interface PlayerEntry {
  game_id: string;
  player_address: string;
  joined_at: string;
  block_number: string;
}

interface WinnerEntry {
  game_id: string;
  player_address: string;
  prize_amount: string;
}

interface AllPlayersResponse {
  playerss: {
    items: PlayerEntry[];
  };
}

interface AllWinnersResponse {
  winnerss: {
    items: WinnerEntry[];
  };
}

export interface PlayerRow {
  address: string;
  totalGames: number;
  totalWins: number;
  winRate: number;
  totalPrizes: bigint;
  lastActive: string;
}

/**
 * Fetches all players and winners, aggregates into a leaderboard.
 * Client-side aggregation since Ponder GraphQL doesn't support GROUP BY.
 */
export function useAllPlayers() {
  return useQuery({
    queryKey: queryKeys.players.list,
    queryFn: async (): Promise<PlayerRow[]> => {
      const [playersData, winnersData] = await Promise.all([
        graphqlRequest<AllPlayersResponse>(GET_ALL_PLAYERS),
        graphqlRequest<AllWinnersResponse>(GET_ALL_WINNERS),
      ]);

      const players = playersData.playerss.items;
      const winners = winnersData.winnerss.items;

      // Group players by address
      const playerMap = new Map<string, { games: Set<string>; lastBlock: string; lastJoined: string }>();
      for (const p of players) {
        const addr = p.player_address.toLowerCase();
        const existing = playerMap.get(addr);
        if (existing) {
          existing.games.add(p.game_id);
          // Track most recent activity by block number
          if (BigInt(p.block_number) > BigInt(existing.lastBlock)) {
            existing.lastBlock = p.block_number;
            existing.lastJoined = p.joined_at;
          }
        } else {
          playerMap.set(addr, {
            games: new Set([p.game_id]),
            lastBlock: p.block_number,
            lastJoined: p.joined_at,
          });
        }
      }

      // Group winners by address
      const winnerMap = new Map<string, { wins: number; totalPrizes: bigint }>();
      for (const w of winners) {
        const addr = w.player_address.toLowerCase();
        const existing = winnerMap.get(addr);
        if (existing) {
          existing.wins += 1;
          existing.totalPrizes += BigInt(w.prize_amount);
        } else {
          winnerMap.set(addr, {
            wins: 1,
            totalPrizes: BigInt(w.prize_amount),
          });
        }
      }

      // Merge into PlayerRow[]
      const rows: PlayerRow[] = [];
      for (const [address, data] of playerMap) {
        const winData = winnerMap.get(address);
        const totalGames = data.games.size;
        const totalWins = winData?.wins ?? 0;
        rows.push({
          address,
          totalGames,
          totalWins,
          winRate: totalGames > 0 ? totalWins / totalGames : 0,
          totalPrizes: winData?.totalPrizes ?? 0n,
          lastActive: data.lastJoined,
        });
      }

      // Sort by totalGames descending
      rows.sort((a, b) => b.totalGames - a.totalGames);

      return rows;
    },
    staleTime: 60_000,
    gcTime: CACHE_TIMES.standard,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}
