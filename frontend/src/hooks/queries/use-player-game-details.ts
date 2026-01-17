import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getPlayerGameDetail, PlayerGameDetail } from '@/lib/supabase';

/**
 * Hook to fetch detailed game information from a player's perspective
 * @param playerAddress - The player's wallet address
 * @param gameId - The game ID
 * @returns Query result with player game details
 */
export function usePlayerGameDetail(
  playerAddress: string,
  gameId: number | string
) {
  return useQuery<PlayerGameDetail | null>({
    queryKey: queryKeys.players.gameDetail(playerAddress, gameId),
    queryFn: () => getPlayerGameDetail(playerAddress, gameId),
    refetchInterval: 30_000, // Poll every 30 seconds
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress && !!gameId,
  });
}
