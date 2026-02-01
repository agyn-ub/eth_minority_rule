/**
 * Polling Configuration for React Query
 *
 * This module centralizes all polling interval configurations for the application.
 * Intervals can be customized via environment variables to support different
 * settings for development (faster feedback) vs production (bandwidth optimization).
 *
 * ## Polling Strategy
 *
 * The application uses a hierarchical polling approach:
 *
 * 1. **Primary Queries** (e.g., useGame) - Poll independently based on game state
 * 2. **Supporting Queries** (e.g., useGamePlayers, useGameVotes) - No polling
 *    - These rely on cache invalidation when primary queries update
 *    - They refetch on window focus for manual refresh
 *    - More efficient than independent polling
 *
 * 3. **List Queries** (e.g., useActiveGames) - Fixed interval polling
 *
 * ## Environment Variables
 *
 * Set these in .env.local to customize intervals (values in milliseconds):
 *
 * - NEXT_PUBLIC_POLL_GAME_ACTIVE=45000      # Active game phases (CommitPhase/RevealPhase)
 * - NEXT_PUBLIC_POLL_GAME_WAITING=60000     # Waiting phase (ZeroPhase)
 * - NEXT_PUBLIC_POLL_GAME_COMPLETED=false   # Completed games (false = no polling)
 * - NEXT_PUBLIC_POLL_GAMES_ACTIVE=45000     # Active games list
 * - NEXT_PUBLIC_POLL_GAMES_COMPLETED=90000  # Completed games list
 *
 * ## Development Mode
 *
 * When NODE_ENV=development and no env vars are set, uses faster defaults:
 * - Active phases: 10 seconds (vs 45s production)
 * - Waiting phases: 15 seconds (vs 60s production)
 * - Game lists: 15 seconds (vs 45s/90s production)
 *
 * This provides faster feedback during local testing while maintaining
 * production efficiency when deployed.
 */

// Type for interval values (milliseconds or false to disable)
type IntervalValue = number | false;

/**
 * Parse environment variable to interval value
 * Supports: "false", "0" (both disable polling), or millisecond numbers
 */
function parseInterval(envValue: string | undefined, defaultValue: IntervalValue): IntervalValue {
  if (!envValue) return defaultValue;
  if (envValue === 'false' || envValue === '0') return false;
  const parsed = parseInt(envValue, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Determine if we're in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Default intervals for production (conservative, bandwidth-efficient)
 */
const PRODUCTION_DEFAULTS = {
  gameActive: 45_000,      // 45 seconds - active game phases
  gameWaiting: 60_000,     // 60 seconds - waiting phase
  gameCompleted: false,    // No polling for completed games
  gamesActive: 45_000,     // 45 seconds - active games list
  gamesCompleted: 90_000,  // 90 seconds - completed games list
} as const;

/**
 * Default intervals for development (faster feedback)
 */
const DEVELOPMENT_DEFAULTS = {
  gameActive: 10_000,      // 10 seconds - quick feedback for testing
  gameWaiting: 15_000,     // 15 seconds - faster waiting state updates
  gameCompleted: false,    // Still no polling for completed games
  gamesActive: 15_000,     // 15 seconds - see new games faster
  gamesCompleted: 30_000,  // 30 seconds - faster historical updates
} as const;

/**
 * Select base defaults based on environment
 */
const BASE_DEFAULTS = isDevelopment ? DEVELOPMENT_DEFAULTS : PRODUCTION_DEFAULTS;

/**
 * Polling interval configuration
 * Uses environment variables if set, otherwise falls back to environment-specific defaults
 */
export const POLLING_INTERVALS = {
  /**
   * Individual game polling intervals (adaptive based on game state)
   */
  game: {
    /** Active game phases (CommitPhase/RevealPhase) - most critical */
    active: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE,
      BASE_DEFAULTS.gameActive
    ),

    /** Waiting phase (ZeroPhase) - less urgent */
    waiting: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_WAITING,
      BASE_DEFAULTS.gameWaiting
    ),

    /** Completed games - typically disabled */
    completed: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_COMPLETED,
      BASE_DEFAULTS.gameCompleted
    ),
  },

  /**
   * Individual query polling intervals
   * Each query can have its own interval, or falls back to game defaults
   */
  players: {
    /** Players polling - defaults to game.waiting */
    interval: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_PLAYERS,
      parseInterval(process.env.NEXT_PUBLIC_POLL_GAME_WAITING, BASE_DEFAULTS.gameWaiting)
    ),
  },

  commits: {
    /** Commits polling - defaults to game.active */
    interval: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_COMMITS,
      parseInterval(process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE, BASE_DEFAULTS.gameActive)
    ),
  },

  votes: {
    /** Votes polling - defaults to game.active */
    interval: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_VOTES,
      parseInterval(process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE, BASE_DEFAULTS.gameActive)
    ),
  },

  rounds: {
    /** Rounds polling - defaults to game.active */
    interval: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_ROUNDS,
      parseInterval(process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE, BASE_DEFAULTS.gameActive)
    ),
  },

  /**
   * Game list polling intervals (fixed intervals)
   */
  games: {
    /** Active games list */
    active: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAMES_ACTIVE,
      BASE_DEFAULTS.gamesActive
    ),

    /** Completed games list (historical data, changes less frequently) */
    completed: parseInterval(
      process.env.NEXT_PUBLIC_POLL_GAMES_COMPLETED,
      BASE_DEFAULTS.gamesCompleted
    ),
  },
} as const;

/**
 * Cache time (gcTime) configuration
 * How long to keep unused query data in cache before garbage collection
 */
export const CACHE_TIMES = {
  /** Standard cache time for most queries */
  standard: 90_000, // 90 seconds

  /** Extended cache time for historical data */
  extended: 120_000, // 2 minutes
} as const;

/**
 * Stale time configuration
 * How long data is considered fresh before needing refetch
 * Generally matches polling intervals
 */
export const STALE_TIMES = {
  game: {
    active: POLLING_INTERVALS.game.active || 45_000,
    waiting: POLLING_INTERVALS.game.waiting || 60_000,
  },
  games: {
    active: POLLING_INTERVALS.games.active || 45_000,
    completed: POLLING_INTERVALS.games.completed || 90_000,
  },
} as const;

/**
 * Shared query options used across the application
 * Note: placeholderData is defined inline in hooks for proper typing
 */
export const COMMON_QUERY_OPTIONS = {
  /** Stop polling when tab is hidden (saves bandwidth) */
  refetchIntervalInBackground: false,

  /** Refetch when user returns to tab */
  refetchOnWindowFocus: true,
} as const;

/**
 * Logging helper for debugging polling configuration
 * Only logs in development mode
 */
export function logPollingConfig() {
  if (isDevelopment) {
    console.log('[Polling Config] Mode:', isDevelopment ? 'development' : 'production');
    console.log('[Polling Config] Environment Variables:', {
      POLL_GAME_COMMITS: process.env.NEXT_PUBLIC_POLL_GAME_COMMITS,
      POLL_GAME_ACTIVE: process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE,
      POLL_GAME_WAITING: process.env.NEXT_PUBLIC_POLL_GAME_WAITING,
    });
    console.log('[Polling Config] Computed Intervals:', {
      'commits.interval': POLLING_INTERVALS.commits.interval,
      'game.active': POLLING_INTERVALS.game.active,
      'game.waiting': POLLING_INTERVALS.game.waiting,
    });
    console.log('[Polling Config] Full Config:', {
      intervals: POLLING_INTERVALS,
      cacheTimes: CACHE_TIMES,
      staleTimes: STALE_TIMES,
    });
  }
}

// Auto-log on import in development
if (isDevelopment && typeof window !== 'undefined') {
  logPollingConfig();
}
