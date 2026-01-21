import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getBatchPlayerGameDetails, BatchPlayerGameDetail } from '@/lib/supabase';

export function useBatchPlayerGameDetails(
  playerAddress: string,
  gameIds: string[]
) {
  return useQuery<BatchPlayerGameDetail[]>({
    queryKey: queryKeys.players.batchGameDetails(playerAddress, gameIds),
    queryFn: () => getBatchPlayerGameDetails(playerAddress, gameIds),
    staleTime: 5 * 60 * 1000, // 5 minutes - historical data
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: !!playerAddress && gameIds.length > 0,
  });
}
