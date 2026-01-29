# How Game Fetching Works - Complete Flow

## Data Flow Overview

```
Homepage Component
        ↓
useGameLists(activePage, completedPage)
        ↓
useActiveGames(page)  ←─── Calls every 10 seconds (refetchInterval)
        ↓
graphqlRequest(GET_ACTIVE_GAMES, {limit: 20, offset: 0})
        ↓
urql GraphQL Client (client.ts)
        ↓
HTTP POST http://localhost:42069/graphql
        ↓
Ponder GraphQL Server
        ↓
PostgreSQL Database (Supabase)
        ↓
Returns 20 games + pagination info
        ↓
React Query Cache (10s TTL)
        ↓
Homepage displays games
```

## Timing Configuration (Where to Change)

### 1. Refetch Intervals (Polling)

**Location:** `frontend/src/hooks/queries/use-games.ts`

```typescript
// Line 61: Active games poll every 10 seconds
export function useActiveGames(page = 1) {
  return useQuery({
    queryKey: queryKeys.games.active(page),
    queryFn: async () => { /* ... */ },
    refetchInterval: 10_000, // ← 10 seconds (10,000 ms)
    //                          Change this to adjust polling frequency
    placeholderData: (previousData) => previousData,
  });
}

// Line 89: Completed games poll every 30 seconds
export function useCompletedGames(page = 1) {
  return useQuery({
    queryKey: queryKeys.games.completed(page),
    queryFn: async () => { /* ... */ },
    refetchInterval: 30_000, // ← 30 seconds (30,000 ms)
    //                          Less frequent because historical data changes less
    placeholderData: (previousData) => previousData,
  });
}
```

**Why different intervals?**
- **Active games (10s):** Games in progress change frequently (commits, reveals, state changes)
- **Completed games (30s):** Historical data, changes rarely

**To change:**
```typescript
refetchInterval: 5_000   // 5 seconds - more frequent
refetchInterval: 20_000  // 20 seconds - less frequent
refetchInterval: false   // Disable auto-refetch (only manual)
```

### 2. Pagination Settings

**Location:** `frontend/src/hooks/queries/use-games.ts`

```typescript
// Lines 45-46 and 74-75: Items per page
const limit = 20;  // ← Number of games per page
//              Change this to fetch more/fewer games
const offset = (page - 1) * limit;
```

**To change:**
```typescript
const limit = 10;  // Smaller pages (faster, more pages)
const limit = 50;  // Larger pages (fewer pages, more data per request)
```

### 3. GraphQL Endpoint URL

**Location:** `frontend/src/lib/graphql/client.ts`

```typescript
// Line 4: Ponder GraphQL URL
const GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_GRAPHQL_URL
                    || 'http://localhost:42069/graphql';
//                      ↑ Default URL
```

**Change via environment variable:**
```bash
# frontend/.env.local
NEXT_PUBLIC_PONDER_GRAPHQL_URL=http://localhost:42069/graphql

# Or for production:
NEXT_PUBLIC_PONDER_GRAPHQL_URL=https://api.yourdomain.com/graphql
```

### 4. Cache Behavior

**Location:** `frontend/src/hooks/queries/use-games.ts`

```typescript
// Line 62: Prevents UI flicker during refetch
placeholderData: (previousData) => previousData,
//                ↑ Shows old data while fetching new data
```

**To change:**
```typescript
placeholderData: undefined,  // Show loading state during refetch
staleTime: 5_000,           // Data considered fresh for 5 seconds
cacheTime: 300_000,         // Keep in cache for 5 minutes
```

## Complete Request Flow (Step-by-Step)

### Initial Load

1. **User opens homepage** (`/`)
2. **Component renders:**
   ```typescript
   const { activeGames, isLoading } = useGameLists(activePage: 1, completedPage: 1);
   ```

3. **useGameLists calls both:**
   - `useActiveGames(1)`
   - `useCompletedGames(1)`

4. **useActiveGames executes:**
   ```typescript
   queryFn: async () => {
     const limit = 20;
     const offset = 0;  // Page 1: (1-1) * 20 = 0

     const data = await graphqlRequest(GET_ACTIVE_GAMES, { limit, offset });
     return { games: data.games.items, ... };
   }
   ```

5. **graphqlRequest makes HTTP call:**
   ```typescript
   POST http://localhost:42069/graphql
   Content-Type: application/json

   {
     "query": "query GetActiveGames($limit: Int!, $offset: Int!) { games(...) }",
     "variables": { "limit": 20, "offset": 0 }
   }
   ```

6. **Ponder returns:**
   ```json
   {
     "data": {
       "games": {
         "items": [
           { "id": "1", "game_id": "5", "state": "CommitPhase", ... },
           { "id": "2", "game_id": "4", "state": "RevealPhase", ... },
           // ... 18 more games
         ],
         "pageInfo": {
           "hasNextPage": true,
           "hasPreviousPage": false
         }
       }
     }
   }
   ```

7. **React Query caches result** with key: `['games', 'active', 1]`

8. **Component renders** with 20 games

### Auto-Refetch (Polling)

**After 10 seconds:**

1. **React Query triggers refetch** (due to `refetchInterval: 10_000`)

2. **Same query executes** (in background)

3. **New data returned** from Ponder

4. **React Query updates cache**

5. **Component re-renders** with new data
   - No loading spinner (due to `placeholderData`)
   - Smooth update

### Page Navigation

**User clicks "Page 2":**

1. **setActivePage(2)** called

2. **useGameLists re-runs** with `activePage: 2`

3. **New query with offset:**
   ```typescript
   const offset = (2 - 1) * 20 = 20;  // Skip first 20 games
   graphqlRequest(GET_ACTIVE_GAMES, { limit: 20, offset: 20 })
   ```

4. **New cache entry:** `['games', 'active', 2]`

5. **Returns games 21-40**

**User clicks back to "Page 1":**

1. **setActivePage(1)** called

2. **React Query checks cache:** `['games', 'active', 1]` exists!

3. **Instant render** from cache (no HTTP request)

4. **Background refetch** after 10 seconds

## GraphQL Query Breakdown

### Active Games Query

```graphql
query GetActiveGames($limit: Int!, $offset: Int!) {
  games(
    where: {
      state_in: ["ZeroPhase", "CommitPhase", "RevealPhase"]
      #          ↑ Filter: Only active games (not Completed)
    }
    limit: $limit         # ← Pagination: How many games
    offset: $offset       # ← Pagination: Skip how many games
    orderBy: "block_number"      # ← Sort: Newest first
    orderDirection: "desc"
  ) {
    items {
      id
      game_id
      question_text
      # ... 15 more fields
    }
    pageInfo {
      hasNextPage        # ← Has more pages?
      hasPreviousPage    # ← Has previous pages?
    }
  }
}
```

**What Ponder does:**
1. Connects to PostgreSQL
2. Executes:
   ```sql
   SELECT * FROM games
   WHERE state IN ('ZeroPhase', 'CommitPhase', 'RevealPhase')
   ORDER BY block_number DESC
   LIMIT 20 OFFSET 0;
   ```
3. Returns JSON response

## Configuration Summary

| Setting | Location | Current Value | Purpose |
|---------|----------|---------------|---------|
| **Active games polling** | `use-games.ts:61` | `10_000` (10s) | How often to refetch active games |
| **Completed games polling** | `use-games.ts:89` | `30_000` (30s) | How often to refetch completed games |
| **Items per page** | `use-games.ts:45,74` | `20` | Games fetched per page |
| **GraphQL endpoint** | `client.ts:4` | `localhost:42069` | Ponder server URL |
| **WebSocket endpoint** | `client.ts:5` | `ws://localhost:42069` | For real-time subscriptions |
| **Cache placeholder** | `use-games.ts:62,90` | `enabled` | Show old data during refetch |

## Performance Impact of Settings

### Polling Frequency

```typescript
refetchInterval: 5_000   // 5s  → More real-time, more server load
refetchInterval: 10_000  // 10s → Balanced (current)
refetchInterval: 30_000  // 30s → Less server load, less real-time
```

**For 100 users:**
- 5s interval: 1200 requests/min to server
- 10s interval: 600 requests/min (current)
- 30s interval: 200 requests/min

### Page Size

```typescript
const limit = 10;  // 10 games/page
// - Smaller payload (~3 KB)
// - More pages to navigate
// - Faster initial load

const limit = 20;  // 20 games/page (current)
// - Balanced (~6 KB)
// - Reasonable navigation
// - Good for most cases

const limit = 50;  // 50 games/page
// - Larger payload (~15 KB)
// - Fewer pages
// - Better for power users
```

## How to Disable Polling (Wait for Subscriptions)

If you want to stop polling and wait for real-time subscriptions:

```typescript
// In use-games.ts
export function useActiveGames(page = 1) {
  return useQuery({
    queryKey: queryKeys.games.active(page),
    queryFn: async () => { /* ... */ },
    refetchInterval: false, // ← Disable polling
    // Will only fetch on:
    // 1. Initial load
    // 2. Manual refetch
    // 3. Window focus
  });
}
```

Then add subscription in a separate effect:

```typescript
useEffect(() => {
  const { unsubscribe } = graphqlClient
    .subscription(GAMES_UPDATED)
    .subscribe((result) => {
      queryClient.setQueryData(['games', 'active', page], result.data);
    });
  return () => unsubscribe();
}, [page]);
```

## Quick Reference

**Want faster updates?**
→ Change `refetchInterval: 10_000` to `5_000`

**Want less server load?**
→ Change `refetchInterval: 10_000` to `30_000`

**Want more games per page?**
→ Change `const limit = 20` to `50`

**Want real-time updates?**
→ Implement subscriptions (replace polling)

**Want different URL?**
→ Update `.env.local` `NEXT_PUBLIC_PONDER_GRAPHQL_URL`
