/**
 * Query key factory for type-safe cache management
 *
 * Hierarchy:
 * - games
 *   - games.all -> all games list
 *   - games.active -> active games list
 *   - games.completed -> completed games list
 *   - games.detail(id) -> single game
 *     - games.players(id) -> game players
 *     - games.votes(id, round?) -> game votes
 *     - games.commits(id, round?) -> game commits
 *     - games.rounds(id) -> round history
 *     - games.winners(id) -> game winners
 */
export const queryKeys = {
  // Game-related keys
  games: {
    all: ['games'] as const,
    active: ['games', 'active'] as const,
    completed: ['games', 'completed'] as const,
    detail: (gameId: number | string) => ['games', 'detail', String(gameId)] as const,
    players: (gameId: number | string) => ['games', 'detail', String(gameId), 'players'] as const,
    votes: (gameId: number | string, round?: number) =>
      round !== undefined
        ? ['games', 'detail', String(gameId), 'votes', round] as const
        : ['games', 'detail', String(gameId), 'votes'] as const,
    commits: (gameId: number | string, round?: number) =>
      round !== undefined
        ? ['games', 'detail', String(gameId), 'commits', round] as const
        : ['games', 'detail', String(gameId), 'commits'] as const,
    rounds: (gameId: number | string) => ['games', 'detail', String(gameId), 'rounds'] as const,
    winners: (gameId: number | string) => ['games', 'detail', String(gameId), 'winners'] as const,
  },
} as const;
