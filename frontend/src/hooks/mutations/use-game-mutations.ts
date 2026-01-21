import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook providing cache invalidation utilities
 * Call these after successful blockchain transactions
 */
export function useGameMutations() {
  const queryClient = useQueryClient();

  // Granular invalidation methods - more efficient than invalidating everything

  const invalidateAfterJoin = useCallback(
    async (gameId: number | string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.players(gameId) }),
      ]);
    },
    [queryClient]
  );

  const invalidateAfterCommit = useCallback(
    async (gameId: number | string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.commits(gameId) }),
      ]);
    },
    [queryClient]
  );

  const invalidateAfterReveal = useCallback(
    async (gameId: number | string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.votes(gameId) }),
      ]);
    },
    [queryClient]
  );

  const invalidateAfterProcessRound = useCallback(
    async (gameId: number | string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.rounds(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.eliminations(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.winners(gameId) }),
      ]);
    },
    [queryClient]
  );

  const invalidateGame = useCallback(
    async (gameId: number | string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.players(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.votes(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.commits(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.rounds(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.winners(gameId) }),
      ]);
    },
    [queryClient]
  );

  const invalidateGameLists = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.games.active }),
      queryClient.invalidateQueries({ queryKey: queryKeys.games.completed }),
    ]);
  }, [queryClient]);

  const optimisticUpdateGame = useCallback(
    <TData,>(gameId: number | string, updater: (oldData: TData | undefined) => TData) => {
      queryClient.setQueryData(queryKeys.games.detail(gameId), updater);
    },
    [queryClient]
  );

  return {
    /**
     * Invalidate only data affected by joining game (detail + players)
     * 60-80% fewer refetches than invalidateGame
     */
    invalidateAfterJoin,

    /**
     * Invalidate only data affected by committing vote (detail + commits)
     * 60-80% fewer refetches than invalidateGame
     */
    invalidateAfterCommit,

    /**
     * Invalidate only data affected by revealing vote (detail + votes)
     * 60-80% fewer refetches than invalidateGame
     */
    invalidateAfterReveal,

    /**
     * Invalidate data affected by processing round (detail + rounds + eliminations + winners)
     */
    invalidateAfterProcessRound,

    /**
     * Invalidate all game-related data for a specific game
     * Use granular methods above when possible for better performance
     */
    invalidateGame,

    /**
     * Invalidate game lists (active/completed)
     * Call after: creating game, game state changes
     */
    invalidateGameLists,

    /**
     * Optimistic update for game state
     * Updates cache immediately before server confirms
     */
    optimisticUpdateGame,
  };
}
