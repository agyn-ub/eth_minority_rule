import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGame, type Game } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { useGamePlayers } from './use-game-players';
import { useGameVotes, useGameCommits } from './use-game-votes';
import { useGameRounds, useGameWinners } from './use-game-rounds';
import { useCurrentRoundData } from './use-current-round-data';
import { useGameHistory } from './use-game-history';

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
  const gameState = gameQuery.data?.state;
  const currentRound = gameQuery.data?.current_round;

  // Memoize options objects to prevent creating new references on every render
  // This prevents child queries from thinking their dependencies changed
  const playersOptions = useMemo(() => ({ gameState }), [gameState]);
  const votesOptions = useMemo(() => ({ gameState, currentRound }), [gameState, currentRound]);
  const commitsOptions = useMemo(() => ({ gameState, currentRound }), [gameState, currentRound]);
  const roundsOptions = useMemo(() => ({ gameState }), [gameState]);
  const winnersOptions = useMemo(() => ({ gameState }), [gameState]);

  const playersQuery = useGamePlayers(gameId, playersOptions);
  const votesQuery = useGameVotes(gameId, undefined, votesOptions);
  const commitsQuery = useGameCommits(gameId, undefined, commitsOptions);
  const roundsQuery = useGameRounds(gameId, roundsOptions);
  const winnersQuery = useGameWinners(gameId, winnersOptions);

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

/**
 * Simplified hook for game detail page with reduced data fetching
 * Uses slower polling (10s) and only fetches current round data
 *
 * This is optimized for performance:
 * - 3 queries instead of 6
 * - 10s polling interval (reduced from 2s)
 * - Only fetches current round data (not all history)
 * - History loaded on-demand
 */
export function useGameDetailSimple(gameId: number | string | undefined) {
  // 1. Game state only (10s polling always)
  const gameQuery = useQuery({
    queryKey: queryKeys.games.detail(gameId!),
    queryFn: () => getGame(gameId!),
    enabled: gameId !== undefined,
    refetchInterval: 10_000, // Fixed 10s polling
    placeholderData: (previousData) => previousData,
    staleTime: 8_000,
  });

  // 2. Current round data only (10s polling)
  const currentRoundQuery = useCurrentRoundData(
    gameId,
    gameQuery.data?.current_round,
    { pollingInterval: 10_000 }
  );

  // 3. History on-demand (no polling, manual refetch)
  const historyQuery = useGameHistory(gameId, {
    enabled: false // Only load when user clicks "Show History"
  });

  return {
    game: gameQuery.data ?? null,
    currentRoundPlayers: currentRoundQuery.data?.players ?? [],
    currentRoundCommits: currentRoundQuery.data?.commits ?? [],
    currentRoundVotes: currentRoundQuery.data?.votes ?? [],
    currentRoundEliminations: currentRoundQuery.data?.eliminations ?? [],
    history: historyQuery.data,
    isLoading: gameQuery.isLoading,
    isError: gameQuery.isError || currentRoundQuery.isError,
    error: gameQuery.error || currentRoundQuery.error,
    loadHistory: historyQuery.refetch,
    refetch: () => {
      gameQuery.refetch();
      currentRoundQuery.refetch();
    },
  };
}
