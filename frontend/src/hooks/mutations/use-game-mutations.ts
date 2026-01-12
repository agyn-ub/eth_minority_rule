import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook providing cache invalidation utilities
 * Call these after successful blockchain transactions
 */
export function useGameMutations() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate all game-related data for a specific game
     * Call after: joining game, committing vote, revealing vote
     */
    invalidateGame: async (gameId: number | string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.players(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.votes(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.commits(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.rounds(gameId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.winners(gameId) }),
      ]);
    },

    /**
     * Invalidate game lists (active/completed)
     * Call after: creating game, game state changes
     */
    invalidateGameLists: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.games.active }),
        queryClient.invalidateQueries({ queryKey: queryKeys.games.completed }),
      ]);
    },

    /**
     * Optimistic update for game state
     * Updates cache immediately before server confirms
     */
    optimisticUpdateGame: <TData>(
      gameId: number | string,
      updater: (oldData: TData | undefined) => TData
    ) => {
      queryClient.setQueryData(queryKeys.games.detail(gameId), updater);
    },
  };
}
