import { useQuery } from '@tanstack/react-query';
import { getGame, type Game } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { POLLING_INTERVALS, COMMON_QUERY_OPTIONS } from '@/lib/polling-config';
import { useGamePlayers } from './use-game-players';
import { useGameVotes, useGameCommits } from './use-game-votes';
import { useGameRounds, useGameWinners } from './use-game-rounds';

/**
 * Hook for fetching a single game with adaptive polling
 *
 * ## Polling Strategy
 * Automatically adjusts polling frequency based on game state:
 * - **Active phases** (CommitPhase/RevealPhase): Fastest polling for critical updates
 * - **Waiting phase** (ZeroPhase): Moderate polling while waiting for players
 * - **Completed**: No polling (game is finished, data won't change)
 *
 * ## Supporting Queries
 * Related queries (players, votes, commits, rounds, winners) don't poll independently.
 * They rely on this primary query's cache invalidation and window focus refetch.
 * This prevents redundant network requests while keeping data fresh.
 *
 * ## Configuration
 * Polling intervals can be customized via environment variables.
 * See src/lib/polling-config.ts for details.
 *
 * @param gameId - The game ID to fetch
 * @param options - Optional query configuration
 */
export function useGame(gameId: number | string | undefined, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.games.detail(gameId!),
    queryFn: () => getGame(gameId!),
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: (query) => {
      const game = query.state.data as Game | null;
      if (!game) return false; // Don't poll if no data yet

      // Adaptive polling based on game state
      switch (game.state) {
        case 'CommitPhase':
        case 'RevealPhase':
          // Most critical - players are actively voting
          return POLLING_INTERVALS.game.active;

        case 'ZeroPhase':
          // Less urgent - waiting for players to join
          return POLLING_INTERVALS.game.waiting;

        case 'Completed':
          // No polling needed - game is finished
          return POLLING_INTERVALS.game.completed;

        default:
          // Fallback for unknown states
          return POLLING_INTERVALS.game.waiting;
      }
    },
    placeholderData: (previousData) => previousData,
    ...COMMON_QUERY_OPTIONS,
  });
}

/**
 * Comprehensive hook that fetches all game data
 * Coordinates multiple queries for a complete game view
 *
 * This is the primary hook for the game detail page
 */
export function useGameDetail(gameId: number | string | undefined) {
  const gameQuery = useGame(gameId);
  const playersQuery = useGamePlayers(gameId, {
    gameState: gameQuery.data?.state,
  });
  const votesQuery = useGameVotes(gameId, undefined, {
    gameState: gameQuery.data?.state,
    currentRound: gameQuery.data?.current_round,
  });
  const commitsQuery = useGameCommits(gameId, undefined, {
    gameState: gameQuery.data?.state,
    currentRound: gameQuery.data?.current_round,
  });
  const roundsQuery = useGameRounds(gameId, {
    gameState: gameQuery.data?.state,
  });
  const winnersQuery = useGameWinners(gameId, {
    gameState: gameQuery.data?.state,
  });

  return {
    // Data
    game: gameQuery.data ?? null,
    players: playersQuery.data ?? [],
    votes: votesQuery.data ?? [],
    commits: commitsQuery.data ?? [],
    rounds: roundsQuery.data ?? [],
    winners: winnersQuery.data ?? [],

    // States
    isLoading: gameQuery.isLoading,
    isError: gameQuery.isError || playersQuery.isError,
    error: gameQuery.error || playersQuery.error,

    // Granular loading states for UI feedback
    isLoadingGame: gameQuery.isLoading,
    isLoadingPlayers: playersQuery.isLoading,
    isLoadingVotes: votesQuery.isLoading,

    // Refetch all
    refetch: () => {
      gameQuery.refetch();
      playersQuery.refetch();
      votesQuery.refetch();
      commitsQuery.refetch();
      roundsQuery.refetch();
      winnersQuery.refetch();
    },
  };
}
