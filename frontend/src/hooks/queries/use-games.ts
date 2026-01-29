import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_ACTIVE_GAMES, GET_COMPLETED_GAMES } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';

// GraphQL response types (will be auto-generated later with codegen)
interface GameItem {
  game_id: string;
  question_text: string;
  entry_fee: string;
  creator_address: string;
  state: string;
  current_round: number;
  total_players: number;
  prize_pool: string;
  commit_deadline?: string;
  reveal_deadline?: string;
  created_at: string;
  updated_at: string;
  block_number: string;
  transaction_hash: string;
}

interface GamesResponse {
  gamess: {
    items: GameItem[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage?: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  };
}

/**
 * Hook for fetching active games with pagination via Ponder GraphQL
 * Refetches on window focus and manual refresh (no auto-polling)
 */
export function useActiveGames(page = 1) {
  return useQuery({
    queryKey: queryKeys.games.active(page),
    queryFn: async () => {
      const limit = 20;
      const offset = (page - 1) * limit;

      const data = await graphqlRequest<GamesResponse, { limit: number; offset: number }>(
        GET_ACTIVE_GAMES,
        { limit, offset }
      );

      // Transform to match expected format
      return {
        games: data.gamess.items,
        totalCount: data.gamess.items.length, // Approximate (GraphQL doesn't return total)
        totalPages: data.gamess.pageInfo.hasNextPage ? page + 1 : page,
        currentPage: page,
      };
    },
    // Disabled auto-polling - only refetches on:
    // 1. Window focus (when user returns to tab)
    // 2. Manual refetch (button click)
    // 3. Cache invalidation (after creating/joining games)
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60_000, // Consider data fresh for 1 minute
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching completed games with pagination via Ponder GraphQL
 * Polls every 30 seconds (historical data changes less frequently)
 */
export function useCompletedGames(page = 1) {
  return useQuery({
    queryKey: queryKeys.games.completed(page),
    queryFn: async () => {
      const limit = 20;
      const offset = (page - 1) * limit;

      const data = await graphqlRequest<GamesResponse, { limit: number; offset: number }>(
        GET_COMPLETED_GAMES,
        { limit, offset }
      );

      return {
        games: data.gamess.items,
        totalCount: data.gamess.items.length,
        totalPages: data.gamess.pageInfo.hasNextPage ? page + 1 : page,
        currentPage: page,
      };
    },
    refetchInterval: 30_000, // 30 seconds
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Combined hook for both active and completed games
 * Now uses Ponder GraphQL with pagination
 */
export function useGameLists(activePage = 1, completedPage = 1) {
  const activeGamesQuery = useActiveGames(activePage);
  const completedGamesQuery = useCompletedGames(completedPage);

  return {
    // Data
    activeGames: activeGamesQuery.data?.games ?? [],
    completedGames: completedGamesQuery.data?.games ?? [],

    // Pagination info
    activeGamesTotal: activeGamesQuery.data?.totalCount ?? 0,
    activeGamesTotalPages: activeGamesQuery.data?.totalPages ?? 0,
    completedGamesTotal: completedGamesQuery.data?.totalCount ?? 0,
    completedGamesTotalPages: completedGamesQuery.data?.totalPages ?? 0,

    // Combined states (keep for backwards compatibility)
    isLoading: activeGamesQuery.isLoading || completedGamesQuery.isLoading,
    isError: activeGamesQuery.isError || completedGamesQuery.isError,
    error: activeGamesQuery.error || completedGamesQuery.error,

    // Granular loading states
    isLoadingActive: activeGamesQuery.isLoading,
    isLoadingCompleted: completedGamesQuery.isLoading,

    // Use isPending for first-time load detection
    isPendingActive: activeGamesQuery.isPending,
    isPendingCompleted: completedGamesQuery.isPending,

    // Refetch
    refetch: () => {
      activeGamesQuery.refetch();
      completedGamesQuery.refetch();
    },
  };
}
