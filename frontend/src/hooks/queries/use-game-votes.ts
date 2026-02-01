import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_GAME_VOTES, GET_GAME_COMMITS } from '@/lib/graphql/queries';
import { queryKeys } from '@/lib/query-keys';

export interface GraphQLVote {
  game_id: string;
  round: number;
  player_address: string;
  vote: boolean;
  revealed_at: string;
  block_number: string;
  transaction_hash: string;
}

export interface GraphQLCommit {
  game_id: string;
  round: number;
  player_address: string;
  commit_hash: string;
  committed_at: string;
  block_number: string;
  transaction_hash: string;
}

/**
 * Hook for fetching votes
 *
 * ## No Independent Polling
 * This query relies on cache invalidation from the main useGame query.
 * When WebSocket or useGame polling detects changes, this refetches automatically.
 */
export function useGameVotes(
  gameId: number | string | undefined,
  round?: number,
  options?: { enabled?: boolean; gameState?: string; currentRound?: number }
) {
  return useQuery({
    queryKey: queryKeys.games.votes(gameId!, round),
    queryFn: async () => {
      const variables: any = { gameId: String(gameId) };
      if (round !== undefined) {
        variables.round = round;
      }
      const data = await graphqlRequest<{ votess: { items: GraphQLVote[] } }>(GET_GAME_VOTES, variables);
      return data.votess.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - relies on cache invalidation
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching commits
 *
 * ## No Independent Polling
 * This query relies on cache invalidation from the main useGame query.
 * When WebSocket or useGame polling detects changes, this refetches automatically.
 */
export function useGameCommits(
  gameId: number | string | undefined,
  round?: number,
  options?: { enabled?: boolean; gameState?: string; currentRound?: number }
) {
  return useQuery({
    queryKey: queryKeys.games.commits(gameId!, round),
    queryFn: async () => {
      const variables: any = { gameId: String(gameId) };
      if (round !== undefined) {
        variables.round = round;
      }
      const data = await graphqlRequest<{ commitss: { items: GraphQLCommit[] } }>(GET_GAME_COMMITS, variables);
      return data.commitss.items;
    },
    enabled: gameId !== undefined && options?.enabled !== false,
    refetchInterval: false, // No polling - relies on cache invalidation
    refetchOnWindowFocus: true,
  });
}
