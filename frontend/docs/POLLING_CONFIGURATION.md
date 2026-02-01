# Polling Configuration Guide

This document explains how polling intervals are configured in the Minority Rule Game frontend.

## Quick Start

### Default Behavior (No Configuration Needed)

The application automatically uses environment-appropriate defaults:

- **Development** (`NODE_ENV=development`): Fast intervals for quick feedback
  - Active game phases: 10 seconds
  - Waiting phases: 15 seconds
  - Game lists: 15-30 seconds

- **Production** (`NODE_ENV=production`): Conservative intervals for bandwidth efficiency
  - Active game phases: 45 seconds
  - Waiting phases: 60 seconds
  - Game lists: 45-90 seconds

### Custom Configuration

To customize polling intervals, add environment variables to `.env.local`:

```bash
# Individual game polling (adaptive based on game state)
NEXT_PUBLIC_POLL_GAME_ACTIVE=45000       # CommitPhase/RevealPhase (milliseconds)
NEXT_PUBLIC_POLL_GAME_WAITING=60000      # ZeroPhase (milliseconds)
NEXT_PUBLIC_POLL_GAME_COMPLETED=false    # Completed games (false = no polling)

# Game list polling
NEXT_PUBLIC_POLL_GAMES_ACTIVE=45000      # Active games list (milliseconds)
NEXT_PUBLIC_POLL_GAMES_COMPLETED=90000   # Completed games list (milliseconds)
```

## Architecture Overview

### Query Hierarchy

The application uses a hierarchical polling approach:

```
┌─────────────────────────────────────┐
│     useGame (Primary Query)         │
│   Adaptive Polling: 10-60s          │
│   Based on game state               │
└──────────────┬──────────────────────┘
               │
               │ Invalidates cache on update
               │
       ┌───────┴───────────────┐
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│ useGamePlayers│       │ useGameVotes│
│ No polling   │        │ No polling  │
│ (refetch on  │        │ (refetch on │
│  focus)      │        │  focus)     │
└─────────────┘         └─────────────┘
```

**Key Points:**
1. **Primary queries** (e.g., `useGame`, `useActiveGames`) poll independently
2. **Supporting queries** (e.g., `useGamePlayers`, `useGameVotes`) don't poll
   - They rely on cache invalidation when primary queries update
   - They refetch when the user focuses the window
   - This prevents redundant network requests

### Adaptive Polling

The `useGame` hook automatically adjusts its polling interval based on game state:

| Game State | Production Interval | Development Interval | Reason |
|------------|---------------------|----------------------|--------|
| CommitPhase | 45 seconds | 10 seconds | Players actively voting |
| RevealPhase | 45 seconds | 10 seconds | Players revealing votes |
| ZeroPhase | 60 seconds | 15 seconds | Waiting for players to join |
| Completed | No polling | No polling | Game finished, data won't change |

### Why Supporting Queries Don't Poll

Supporting queries like `useGamePlayers`, `useGameVotes`, etc. have `refetchInterval: false`. This is intentional:

1. **Efficiency**: Prevents redundant requests for related data
2. **Shared cache**: When `useGame` polls and gets new data, the cache is shared across all queries
3. **Window focus**: All queries refetch when the user returns to the tab
4. **Cache invalidation**: After blockchain writes, `useGameMutations()` triggers refetch for all related queries

## Configuration Files

### `src/lib/polling-config.ts`

Central configuration file that:
- Exports `POLLING_INTERVALS` object with all interval values
- Provides environment-aware defaults
- Parses environment variables
- Includes comprehensive documentation

### Updated Query Hooks

The following hooks now use the centralized configuration:

- `src/hooks/queries/use-game.ts` - Adaptive polling for individual games
- `src/hooks/queries/use-games.ts` - Fixed polling for game lists

### Environment Files

- `.env.example` - Documents all available polling environment variables
- `.env.local` - Your local overrides (not committed to git)

## Common Scenarios

### Scenario 1: Faster Development Feedback

Default development settings (10-15s) should be fine, but if you want even faster:

```bash
# .env.local
NEXT_PUBLIC_POLL_GAME_ACTIVE=5000   # 5 seconds
NEXT_PUBLIC_POLL_GAME_WAITING=5000  # 5 seconds
```

### Scenario 2: Debugging Polling Issues

Disable polling completely to test manual refresh:

```bash
# .env.local
NEXT_PUBLIC_POLL_GAME_ACTIVE=false
NEXT_PUBLIC_POLL_GAME_WAITING=false
NEXT_PUBLIC_POLL_GAMES_ACTIVE=false
NEXT_PUBLIC_POLL_GAMES_COMPLETED=false
```

### Scenario 3: Production Testing Locally

Use production-like intervals in development:

```bash
# .env.local
NODE_ENV=production  # Or use production interval values explicitly
NEXT_PUBLIC_POLL_GAME_ACTIVE=45000
NEXT_PUBLIC_POLL_GAME_WAITING=60000
```

## Debugging

### View Current Configuration

In development mode, polling configuration is automatically logged to console on page load:

```javascript
[Polling Config] {
  mode: 'development',
  intervals: { game: {...}, games: {...} },
  cacheTimes: {...},
  staleTimes: {...}
}
```

### Manual Configuration Check

You can also call `logPollingConfig()` from the browser console:

```javascript
import { logPollingConfig } from '@/lib/polling-config';
logPollingConfig();
```

## Performance Considerations

### Bandwidth Optimization

The configuration includes several bandwidth-saving features:

1. **Background polling disabled**: `refetchIntervalInBackground: false`
   - Polling stops when the browser tab is hidden
   - Saves bandwidth and server load

2. **Stale time matches polling**: `staleTime` equals polling interval
   - Prevents unnecessary refetches within the interval
   - Data is considered fresh for the entire polling period

3. **Garbage collection**: `gcTime` cleans up unused cache
   - Standard: 90 seconds for most queries
   - Extended: 120 seconds for historical data

4. **Placeholder data**: `placeholderData: keepPreviousData`
   - Shows previous data while refetching
   - Eliminates loading flickers

### Network Request Minimization

The hierarchical polling approach reduces network requests:

- **Without hierarchy**: Each query polls independently = 6+ requests per interval
- **With hierarchy**: Only primary query polls = 1 request per interval
- **Efficiency gain**: 6x reduction in network traffic

## Migration Guide

### Before (Hardcoded Intervals)

```typescript
// Old code - hardcoded values
refetchInterval: 45_000,
```

### After (Configurable Intervals)

```typescript
// New code - uses configuration
import { POLLING_INTERVALS } from '@/lib/polling-config';

refetchInterval: POLLING_INTERVALS.game.active,
```

### Benefits

1. **Centralized management**: Change intervals in one place
2. **Environment awareness**: Automatic dev/prod optimization
3. **Easy customization**: Override via environment variables
4. **Better documentation**: All intervals explained in config file
5. **Type safety**: TypeScript ensures correct usage

## Troubleshooting

### Issue: Polling seems slow in development

**Solution**: Check if you have environment variables overriding the defaults

```bash
# Remove or comment out these lines in .env.local
# NEXT_PUBLIC_POLL_GAME_ACTIVE=45000
```

### Issue: Too many network requests

**Solution**: Ensure supporting queries have `refetchInterval: false`

```typescript
// Supporting queries should NOT poll
export function useGamePlayers(gameId: number) {
  return useQuery({
    // ... other options
    refetchInterval: false,  // ✓ Correct - no polling
  });
}
```

### Issue: Data not updating

**Solution**: Check cache invalidation is working

```typescript
// After blockchain write
const { invalidateGame } = useGameMutations();
await invalidateGame(gameId);  // This triggers refetch
```

## Future Improvements

Potential enhancements to consider:

1. **Real-time updates**: WebSocket subscriptions for instant updates
2. **Exponential backoff**: Increase interval if no changes detected
3. **User preference**: Allow users to control polling speed via UI
4. **Network-aware polling**: Slow down on poor connections
5. **Server-sent events**: Push updates from server instead of polling

## References

- Main configuration: `src/lib/polling-config.ts`
- Query hooks: `src/hooks/queries/`
- React Query docs: https://tanstack.com/query
- Project docs: `CLAUDE.md`
