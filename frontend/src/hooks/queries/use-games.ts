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
 * Uses cursor-based pagination (not offset-based)
 * Refetches on window focus and manual refresh (no auto-polling)
 */
export function useActiveGames(page = 1) {
  return useQuery({
    queryKey: queryKeys.games.active(page),
    queryFn: async () => {
      const limit = 20;
      // For now, just fetch first page (cursor pagination needs refactoring)
      const after = undefined; // TODO: Track cursors properly

      const data = await graphqlRequest<GamesResponse, { limit: number; after?: string }>(
        GET_ACTIVE_GAMES,
        { limit, after }
      );

      // Transform to match expected format
      return {
        games: data.gamess.items,
        totalCount: data.gamess.items.length,
        totalPages: data.gamess.pageInfo.hasNextPage ? page + 1 : page,
        currentPage: page,
        endCursor: data.gamess.pageInfo.endCursor,
      };
    },
    // Auto-polling every 45 seconds for game updates
    refetchInterval: 45_000, // Poll every 45 seconds
    refetchIntervalInBackground: false, // Stop polling when tab is hidden (saves bandwidth)
    refetchOnWindowFocus: true, // Refetch when returning to tab
    staleTime: 45_000, // Match polling interval
    gcTime: 90_000, // Clean up old cache after 90 seconds (prevents memory leak)
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching completed games with pagination via Ponder GraphQL
 * Uses cursor-based pagination (not offset-based)
 * Polls every 30 seconds (historical data changes less frequently)
 */
export function useCompletedGames(page = 1) {
  return useQuery({
    queryKey: queryKeys.games.completed(page),
    queryFn: async () => {
      const limit = 20;
      // For now, just fetch first page (cursor pagination needs refactoring)
      const after = undefined; // TODO: Track cursors properly

      const data = await graphqlRequest<GamesResponse, { limit: number; after?: string }>(
        GET_COMPLETED_GAMES,
        { limit, after }
      );

      return {
        games: data.gamess.items,
        totalCount: data.gamess.items.length,
        totalPages: data.gamess.pageInfo.hasNextPage ? page + 1 : page,
        currentPage: page,
        endCursor: data.gamess.pageInfo.endCursor,
      };
    },
    // Completed games change less frequently - poll every 90 seconds
    refetchInterval: 90_000,
    refetchIntervalInBackground: false, // Stop polling when tab is hidden
    refetchOnWindowFocus: true,
    staleTime: 90_000,
    gcTime: 120_000, // Clean up old cache after 2 minutes
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
