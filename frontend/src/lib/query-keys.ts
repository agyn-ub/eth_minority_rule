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
 *     - games.currentRoundData(id, round) -> current round data (players, commits, votes)
 *     - games.history(id) -> game history (rounds, winners)
 * - players
 *   - players.all -> all players
 *   - players.search(query) -> player search results
 *   - players.stats(address) -> player stats overview
 *   - players.votes(address) -> all player votes
 *   - players.gameDetail(address, gameId) -> player's game detail
 *   - players.batchGameDetails(address, gameIds) -> batch game details for player
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
    eliminations: (gameId: number | string) => ['games', 'detail', String(gameId), 'eliminations'] as const,
    currentRoundData: (gameId: number | string, round: number) =>
      ['games', 'detail', String(gameId), 'currentRoundData', round] as const,
    history: (gameId: number | string) => ['games', 'detail', String(gameId), 'history'] as const,
  },
  // Player-related keys
  players: {
    all: ['players'] as const,
    search: (query: string) => ['players', 'search', query] as const,
    stats: (address: string) => ['players', 'stats', address.toLowerCase()] as const,
    votes: (address: string) => ['players', 'votes', address.toLowerCase()] as const,
    gameDetail: (address: string, gameId: number | string) =>
      ['players', 'detail', address.toLowerCase(), 'game', String(gameId)] as const,
    batchGameDetails: (address: string, gameIds: string[]) =>
      ['players', 'batch-details', address.toLowerCase(), ...gameIds.sort()] as const,
  },
} as const;
