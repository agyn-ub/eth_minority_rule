import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_ACTIVE_GAMES, GET_COMPLETED_GAMES } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';
import {
  POLLING_INTERVALS,
  COMMON_QUERY_OPTIONS,
  STALE_TIMES,
  CACHE_TIMES,
} from '@/lib/polling-config';

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
 *
 * ## Polling Strategy
 * Uses fixed-interval polling to keep the active games list fresh.
 * Polling can be customized via NEXT_PUBLIC_POLL_GAMES_ACTIVE env var.
 *
 * ## Cursor Pagination
 * Uses cursor-based pagination (not offset-based).
 * TODO: Properly track cursors for efficient page navigation.
 *
 * @param page - Page number (1-based)
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
    refetchInterval: POLLING_INTERVALS.games.active,
    staleTime: STALE_TIMES.games.active,
    gcTime: CACHE_TIMES.standard,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}

/**
 * Hook for fetching completed games with pagination via Ponder GraphQL
 *
 * ## Polling Strategy
 * Polls at a slower rate than active games since historical data changes
 * less frequently. Customizable via NEXT_PUBLIC_POLL_GAMES_COMPLETED env var.
 *
 * ## Cursor Pagination
 * Uses cursor-based pagination (not offset-based).
 * TODO: Properly track cursors for efficient page navigation.
 *
 * @param page - Page number (1-based)
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
    refetchInterval: POLLING_INTERVALS.games.completed,
    staleTime: STALE_TIMES.games.completed,
    gcTime: CACHE_TIMES.extended,
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
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
