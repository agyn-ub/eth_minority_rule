/**
 * Polling Configuration for React Query
 *
 * This module centralizes all polling interval configurations for the application.
 * All core polling intervals are REQUIRED via environment variables - the app will
 * crash with clear error messages if required variables are missing.
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
 * ## Required Environment Variables
 *
 * These MUST be set in .env.local (app will crash if missing):
 *
 * - NEXT_PUBLIC_POLL_GAME_ACTIVE      # Active game phases (CommitPhase/RevealPhase)
 * - NEXT_PUBLIC_POLL_GAME_WAITING     # Waiting phase (ZeroPhase)
 * - NEXT_PUBLIC_POLL_GAME_COMPLETED   # Completed games (use "false" to disable)
 * - NEXT_PUBLIC_POLL_GAMES_ACTIVE     # Active games list
 * - NEXT_PUBLIC_POLL_GAMES_COMPLETED  # Completed games list
 *
 * Values: positive integers in milliseconds OR "false" to disable
 * Min: 1000ms (1 second), Max: 300000ms (5 minutes)
 *
 * ## Optional Environment Variables
 *
 * Fine-grained control (falls back to main intervals if not set):
 *
 * - NEXT_PUBLIC_POLL_GAME_PLAYERS  # Overrides POLL_GAME_WAITING
 * - NEXT_PUBLIC_POLL_GAME_COMMITS  # Overrides POLL_GAME_ACTIVE
 * - NEXT_PUBLIC_POLL_GAME_VOTES    # Overrides POLL_GAME_ACTIVE
 * - NEXT_PUBLIC_POLL_GAME_ROUNDS   # Overrides POLL_GAME_ACTIVE
 *
 * ## Recommended Values
 *
 * - Development: 10000-15000ms for quick feedback
 * - Production: 45000-90000ms for bandwidth efficiency
 *
 * See .env.example for complete configuration examples.
 *
 * ## Migration Note
 *
 * Previous versions auto-configured defaults based on NODE_ENV. This has been
 * removed to ensure explicit configuration and prevent accidental misconfigurations.
 */

// Type for interval values (milliseconds or false to disable)
type IntervalValue = number | false;

/**
 * Parse and validate required environment variable for polling interval
 * Throws error if missing or invalid
 */
function parseRequiredInterval(
  envValue: string | undefined,
  varName: string
): IntervalValue {
  // Missing value
  if (envValue === undefined || envValue === '') {
    throw new Error(
      `[Polling Config] Missing required environment variable: ${varName}\n` +
      `Please set this in your .env.local file.\n` +
      `See .env.example for recommended values.`
    );
  }

  // Explicit disable
  if (envValue === 'false' || envValue === '0') {
    return false;
  }

  // Parse numeric value
  const parsed = parseInt(envValue, 10);

  // Validation
  if (isNaN(parsed)) {
    throw new Error(
      `[Polling Config] Invalid value for ${varName}: "${envValue}"\n` +
      `Expected: positive integer (milliseconds) or "false" to disable`
    );
  }

  if (parsed < 1000) {
    throw new Error(
      `[Polling Config] ${varName} is too low: ${parsed}ms\n` +
      `Minimum allowed: 1000ms (1 second)`
    );
  }

  if (parsed > 300000) {
    throw new Error(
      `[Polling Config] ${varName} is too high: ${parsed}ms\n` +
      `Maximum allowed: 300000ms (5 minutes)`
    );
  }

  return parsed;
}

/**
 * Parse optional interval that falls back to another interval
 */
function parseOptionalInterval(
  envValue: string | undefined,
  varName: string,
  fallbackValue: IntervalValue
): IntervalValue {
  if (envValue === undefined || envValue === '') {
    return fallbackValue;
  }
  return parseRequiredInterval(envValue, varName);
}

/**
 * Polling interval configuration
 * All core intervals are required and must be explicitly configured via environment variables
 */
export const POLLING_INTERVALS = {
  /**
   * Individual game polling intervals (adaptive based on game state)
   */
  game: {
    /** Active game phases (CommitPhase/RevealPhase) - REQUIRED */
    active: parseRequiredInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE,
      'NEXT_PUBLIC_POLL_GAME_ACTIVE'
    ),

    /** Waiting phase (ZeroPhase) - REQUIRED */
    waiting: parseRequiredInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_WAITING,
      'NEXT_PUBLIC_POLL_GAME_WAITING'
    ),

    /** Completed games - REQUIRED */
    completed: parseRequiredInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_COMPLETED,
      'NEXT_PUBLIC_POLL_GAME_COMPLETED'
    ),
  },

  /**
   * Individual query polling intervals
   * Each query can have its own interval, or falls back to game defaults
   */
  players: {
    /** Players polling - optional, falls back to game.waiting */
    interval: parseOptionalInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_PLAYERS,
      'NEXT_PUBLIC_POLL_GAME_PLAYERS',
      parseRequiredInterval(
        process.env.NEXT_PUBLIC_POLL_GAME_WAITING,
        'NEXT_PUBLIC_POLL_GAME_WAITING'
      )
    ),
  },

  commits: {
    /** Commits polling - optional, falls back to game.active */
    interval: parseOptionalInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_COMMITS,
      'NEXT_PUBLIC_POLL_GAME_COMMITS',
      parseRequiredInterval(
        process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE,
        'NEXT_PUBLIC_POLL_GAME_ACTIVE'
      )
    ),
  },

  votes: {
    /** Votes polling - optional, falls back to game.active */
    interval: parseOptionalInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_VOTES,
      'NEXT_PUBLIC_POLL_GAME_VOTES',
      parseRequiredInterval(
        process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE,
        'NEXT_PUBLIC_POLL_GAME_ACTIVE'
      )
    ),
  },

  rounds: {
    /** Rounds polling - optional, falls back to game.active */
    interval: parseOptionalInterval(
      process.env.NEXT_PUBLIC_POLL_GAME_ROUNDS,
      'NEXT_PUBLIC_POLL_GAME_ROUNDS',
      parseRequiredInterval(
        process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE,
        'NEXT_PUBLIC_POLL_GAME_ACTIVE'
      )
    ),
  },

  /**
   * Game list polling intervals (fixed intervals)
   */
  games: {
    /** Active games list - REQUIRED */
    active: parseRequiredInterval(
      process.env.NEXT_PUBLIC_POLL_GAMES_ACTIVE,
      'NEXT_PUBLIC_POLL_GAMES_ACTIVE'
    ),

    /** Completed games list - REQUIRED */
    completed: parseRequiredInterval(
      process.env.NEXT_PUBLIC_POLL_GAMES_COMPLETED,
      'NEXT_PUBLIC_POLL_GAMES_COMPLETED'
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
    active: POLLING_INTERVALS.game.active || 0,
    waiting: POLLING_INTERVALS.game.waiting || 0,
  },
  games: {
    active: POLLING_INTERVALS.games.active || 0,
    completed: POLLING_INTERVALS.games.completed || 0,
  },
} as const;

/**
 * Shared query options used across the application
 * Note: placeholderData is defined inline in hooks for proper typing
 */
export const COMMON_QUERY_OPTIONS = {
  /** Stop polling when tab is hidden (saves bandwidth) */
  refetchIntervalInBackground: false,

  /** Disable refetch on window focus - rely on polling only */
  refetchOnWindowFocus: false,
} as const;

/**
 * Logging helper for debugging polling configuration
 */
export function logPollingConfig() {
  console.log('[Polling Config] Environment Variables:', {
    POLL_GAME_ACTIVE: process.env.NEXT_PUBLIC_POLL_GAME_ACTIVE,
    POLL_GAME_WAITING: process.env.NEXT_PUBLIC_POLL_GAME_WAITING,
    POLL_GAME_COMPLETED: process.env.NEXT_PUBLIC_POLL_GAME_COMPLETED,
    POLL_GAMES_ACTIVE: process.env.NEXT_PUBLIC_POLL_GAMES_ACTIVE,
    POLL_GAMES_COMPLETED: process.env.NEXT_PUBLIC_POLL_GAMES_COMPLETED,
    // Optional
    POLL_GAME_PLAYERS: process.env.NEXT_PUBLIC_POLL_GAME_PLAYERS || '(using POLL_GAME_WAITING)',
    POLL_GAME_COMMITS: process.env.NEXT_PUBLIC_POLL_GAME_COMMITS || '(using POLL_GAME_ACTIVE)',
    POLL_GAME_VOTES: process.env.NEXT_PUBLIC_POLL_GAME_VOTES || '(using POLL_GAME_ACTIVE)',
    POLL_GAME_ROUNDS: process.env.NEXT_PUBLIC_POLL_GAME_ROUNDS || '(using POLL_GAME_ACTIVE)',
  });
  console.log('[Polling Config] Computed Intervals:', POLLING_INTERVALS);
}

// Auto-log on import if in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  logPollingConfig();
}
