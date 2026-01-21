/**
 * Adaptive polling strategies for React Query
 *
 * Reduces unnecessary network requests by adjusting poll intervals based on game state:
 * - Completed games: Stop polling static data entirely
 * - Active phases (Commit/Reveal): Poll frequently (2s)
 * - Waiting phase (Zero): Poll moderately (5s)
 * - Static data: Poll infrequently when not expected to change
 *
 * Expected impact: 70-85% reduction in network requests
 */

export type GameState = 'ZeroPhase' | 'CommitPhase' | 'RevealPhase' | 'Completed';

/**
 * Get polling interval for a query based on game state and data type
 *
 * @param gameState - Current game state from blockchain
 * @param dataType - 'static' for data that rarely changes (players, rounds), 'dynamic' for data that changes often (votes, commits)
 * @returns Polling interval in milliseconds, or false to disable polling
 */
export function getPollingInterval(
  gameState: GameState | undefined,
  dataType: 'static' | 'dynamic'
): number | false {
  // No game state yet - use conservative polling
  if (!gameState) {
    return dataType === 'static' ? 10_000 : 5_000;
  }

  // Completed games - minimal or no polling
  if (gameState === 'Completed') {
    return dataType === 'static' ? false : 30_000; // Static: no polling, Dynamic: 30s
  }

  // Static data (players, rounds, eliminations)
  if (dataType === 'static') {
    switch (gameState) {
      case 'ZeroPhase':
        // Players can join in ZeroPhase
        return 3_000;
      case 'CommitPhase':
      case 'RevealPhase':
        // Players don't change during active rounds
        return 10_000;
      default:
        return 5_000;
    }
  }

  // Dynamic data (votes, commits)
  switch (gameState) {
    case 'CommitPhase':
    case 'RevealPhase':
      // Active phases - poll frequently
      return 2_000;
    case 'ZeroPhase':
      // Waiting phase - moderate polling
      return 5_000;
    default:
      return 5_000;
  }
}

/**
 * Get stale time for a query based on polling interval
 * Data is considered stale if it hasn't been fetched within this time
 *
 * @param pollingInterval - The polling interval from getPollingInterval
 * @returns Stale time in milliseconds, or Infinity for no refetching
 */
export function getStaleTime(pollingInterval: number | false): number {
  if (pollingInterval === false) {
    return Infinity; // Never refetch
  }
  return pollingInterval;
}
