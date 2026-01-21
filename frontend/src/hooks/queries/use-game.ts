import { useQuery } from '@tanstack/react-query';
import { getGame, type Game } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { useGamePlayers } from './use-game-players';
import { useGameVotes, useGameCommits } from './use-game-votes';
import { useGameRounds, useGameWinners } from './use-game-rounds';

/**
 * Hook for fetching a single game
 * Adaptive polling based on game state:
 * - Active games (CommitPhase/RevealPhase): 2 seconds (critical)
 * - Waiting states (ZeroPhase): 5 seconds (less urgent)
 * - Completed: 30 seconds (historical)
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
      if (!game) return false; // Don't poll if no data

      // Adaptive polling based on game state
      switch (game.state) {
        case 'CommitPhase':
        case 'RevealPhase':
          return 2_000; // 2 seconds - critical real-time
        case 'ZeroPhase':
          return 5_000; // 5 seconds - waiting for players
        case 'Completed':
          return 30_000; // 30 seconds - historical
        default:
          return 5_000; // Default fallback
      }
    },
    placeholderData: (previousData) => previousData,
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
  const playersQuery = useGamePlayers(gameId);
  const votesQuery = useGameVotes(gameId, undefined, {
    gameState: gameQuery.data?.state,
    currentRound: gameQuery.data?.current_round,
  });
  const commitsQuery = useGameCommits(gameId, undefined, {
    gameState: gameQuery.data?.state,
    currentRound: gameQuery.data?.current_round,
  });
  const roundsQuery = useGameRounds(gameId);
  const winnersQuery = useGameWinners(gameId);

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
