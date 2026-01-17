import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { searchPlayers, PlayerSearchResult } from '@/lib/supabase';

interface UsePlayerSearchOptions {
  enabled?: boolean;
}

/**
 * Hook to search for players by wallet address
 * @param query - Search query (minimum 3 characters)
 * @param options - Query options
 * @returns Query result with player search results
 */
export function usePlayerSearch(
  query: string,
  options?: UsePlayerSearchOptions
) {
  return useQuery<PlayerSearchResult[]>({
    queryKey: queryKeys.players.search(query),
    queryFn: () => searchPlayers(query),
    enabled: (options?.enabled ?? true) && query.length >= 3,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
