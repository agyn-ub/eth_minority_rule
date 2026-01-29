import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook providing cache invalidation utilities
 * Call these after successful blockchain transactions
 */
export function useGameMutations() {
  const queryClient = useQueryClient();

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
    // Invalidate all pages of active and completed games
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['games', 'active'] }),
      queryClient.invalidateQueries({ queryKey: ['games', 'completed'] }),
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
     * Invalidate all game-related data for a specific game
     * Call after: joining game, committing vote, revealing vote
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
