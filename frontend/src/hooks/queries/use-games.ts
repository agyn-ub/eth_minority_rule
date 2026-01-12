import { useQuery } from '@tanstack/react-query';
import { getActiveGames, getCompletedGames } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for fetching active games
 * Polls every 10 seconds to catch new games and state changes
 */
export function useActiveGames() {
  return useQuery({
    queryKey: queryKeys.games.active,
    queryFn: getActiveGames,
    refetchInterval: 10_000, // 10 seconds
    placeholderData: (previousData) => previousData, // No flicker during refetch
  });
}

/**
 * Hook for fetching completed games
 * Polls every 30 seconds (historical data changes less frequently)
 */
export function useCompletedGames() {
  return useQuery({
    queryKey: queryKeys.games.completed,
    queryFn: getCompletedGames,
    refetchInterval: 30_000, // 30 seconds
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Combined hook for both active and completed games
 * Returns both queries with coordinated loading states
 */
export function useGameLists() {
  const activeGamesQuery = useActiveGames();
  const completedGamesQuery = useCompletedGames();

  return {
    activeGames: activeGamesQuery.data ?? [],
    completedGames: completedGamesQuery.data ?? [],
    isLoading: activeGamesQuery.isLoading || completedGamesQuery.isLoading,
    isError: activeGamesQuery.isError || completedGamesQuery.isError,
    error: activeGamesQuery.error || completedGamesQuery.error,
    refetch: () => {
      activeGamesQuery.refetch();
      completedGamesQuery.refetch();
    },
  };
}
