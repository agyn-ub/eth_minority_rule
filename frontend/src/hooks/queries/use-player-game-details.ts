import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { PlayerGameDetail, getBatchPlayerGameDetails } from '@/lib/supabase';

/**
 * @deprecated Use useBatchPlayerGameDetails instead for better performance
 * Fetches individual game detail for a player.
 * Consider batching multiple games when possible.
 *
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
    queryFn: async () => {
      // Use batch function with single game ID as workaround
      const results = await getBatchPlayerGameDetails(playerAddress, [String(gameId)]);
      return results.length > 0 ? results[0] : null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - historical data doesn't change often
    refetchInterval: false, // Disable polling for historical game data
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress && !!gameId,
  });
}
