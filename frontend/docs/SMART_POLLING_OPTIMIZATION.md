# Smart Polling Optimization - Conditional Polling by Game Stage

## Overview

Implemented **smart polling** that only polls when data can actually change, reducing network requests by **50-67%** based on game stage.

---

## The Problem

Previously, all queries polled continuously regardless of whether their data could change:

```typescript
// ❌ WASTEFUL - Polling player list during RevealPhase
// (Players can't join after ZeroPhase)
useGamePlayers → Polls every 10s ❌
useGameVotes   → Polls every 10s ❌
useGameCommits → Polls every 10s ❌
useGameRounds  → Polls every 10s ❌
useGameWinners → Polls every 10s ❌
```

**Result**: Unnecessary network requests for data that can't change.

---

## The Solution

Each query now only polls during phases when its data can actually change:

### useGamePlayers
```typescript
// ✅ SMART - Only poll when players can join
ZeroPhase:     Poll every 15s  ✅ (players joining)
CommitPhase:   No polling      ✅ (player list locked)
RevealPhase:   No polling      ✅ (player list locked)
Completed:     No polling      ✅ (player list locked)
```

### useGameCommits
```typescript
// ✅ SMART - Only poll when commits are being submitted
ZeroPhase:     No polling      ✅ (no commits yet)
CommitPhase:   Poll every 10s  ✅ (commits being submitted)
RevealPhase:   No polling      ✅ (commits locked)
Completed:     No polling      ✅ (commits locked)
```

### useGameVotes
```typescript
// ✅ SMART - Only poll when votes are being revealed
ZeroPhase:     No polling      ✅ (no votes yet)
CommitPhase:   No polling      ✅ (votes hidden)
RevealPhase:   Poll every 10s  ✅ (votes being revealed)
Completed:     No polling      ✅ (votes locked)
```

### useGameRounds
```typescript
// ✅ SMART - Only poll during active phases
ZeroPhase:     No polling      ✅ (no rounds yet)
CommitPhase:   Poll every 10s  ✅ (rounds can be processed)
RevealPhase:   Poll every 10s  ✅ (rounds can be processed)
Completed:     No polling      ✅ (rounds locked)
```

### useGameWinners
```typescript
// ✅ SMART - Never poll (static historical data)
ZeroPhase:     No polling      ✅ (no winners yet)
CommitPhase:   No polling      ✅ (no winners yet)
RevealPhase:   No polling      ✅ (no winners yet)
Completed:     No polling      ✅ (winners are static)
```

---

## Network Request Reduction

### Before (Always Polling)

```
Every 10s: [Game, Players, Votes, Commits, Rounds, Winners] = 6 requests
```

**Total**: 6 requests every 10 seconds = **360 requests/minute**

### After (Smart Polling)

**ZeroPhase (Players Joining):**
```
Every 10-15s: [Game, Players] = 2 requests
```

**CommitPhase (Players Committing):**
```
Every 10s: [Game, Commits, Rounds] = 3 requests
```

**RevealPhase (Players Revealing):**
```
Every 10s: [Game, Votes, Rounds] = 3 requests
```

**Completed (Game Over):**
```
Every 10s: [Game] = 1 request
(or 0 if we also stop polling useGame for completed games)
```

**Total**: 1-3 requests every 10 seconds = **60-180 requests/minute**

### Savings

- **ZeroPhase**: 67% fewer requests (6 → 2)
- **CommitPhase**: 50% fewer requests (6 → 3)
- **RevealPhase**: 50% fewer requests (6 → 3)
- **Completed**: 83% fewer requests (6 → 1)

**Average savings: 50-67% fewer network requests** 🎉

---

## Implementation Details

### Query Hook Pattern

Each hook checks `gameState` and returns `false` to stop polling when data can't change:

```typescript
refetchInterval: () => {
  const gameState = options?.gameState;

  // Only poll when data can change
  if (gameState === 'CommitPhase') {
    return POLLING_INTERVALS.gameDetails.active; // Poll
  }

  // Data locked, stop polling
  return false;
}
```

### Files Modified

1. ✅ `src/hooks/queries/use-game-players.ts`
   - Polls: **ZeroPhase only**
   - Stops: CommitPhase, RevealPhase, Completed

2. ✅ `src/hooks/queries/use-game-votes.ts`
   - **useGameVotes**: Polls **RevealPhase only**
   - **useGameCommits**: Polls **CommitPhase only**

3. ✅ `src/hooks/queries/use-game-rounds.ts`
   - **useGameRounds**: Polls **CommitPhase + RevealPhase**
   - **useGameWinners**: **Never polls** (static data)

---

## Benefits

### 1. Reduced Network Traffic 📉
- 50-67% fewer HTTP requests
- Less bandwidth usage
- Lower server load
- Faster page performance

### 2. Battery Savings 🔋
- Mobile devices benefit from fewer network operations
- Less CPU usage for parsing responses

### 3. Cost Savings 💰
- Fewer database queries
- Reduced API server load
- Lower infrastructure costs

### 4. Better UX ✨
- Page feels snappier (less background activity)
- More predictable behavior
- Still responsive (window focus refetch works)

---

## Still Responsive!

Even though polling is conditional, data stays fresh via:

1. **Window focus refetch**: All queries refetch when you return to the tab
2. **Manual refetch**: Queries still respond to manual invalidation
3. **Initial load**: Data loads immediately on page load

---

## Example: Game Lifecycle

### Game Creation → Completion

```
┌─────────────────────────────────────────────────────┐
│ ZeroPhase (Players Joining)                         │
│ Polling: [Game, Players]                            │
│ 2 requests every 15s                                │
└─────────────────────────────────────────────────────┘
                    ↓
         Commit deadline set
                    ↓
┌─────────────────────────────────────────────────────┐
│ CommitPhase (Players Committing)                    │
│ Polling: [Game, Commits, Rounds]                    │
│ 3 requests every 10s                                │
└─────────────────────────────────────────────────────┘
                    ↓
         Reveal deadline set
                    ↓
┌─────────────────────────────────────────────────────┐
│ RevealPhase (Players Revealing)                     │
│ Polling: [Game, Votes, Rounds]                      │
│ 3 requests every 10s                                │
└─────────────────────────────────────────────────────┘
                    ↓
         Round processed
                    ↓
┌─────────────────────────────────────────────────────┐
│ Completed (Game Over)                               │
│ Polling: [Game]                                     │
│ 1 request every 10s (or 0 with further optimization)│
└─────────────────────────────────────────────────────┘
```

---

## Testing

### Verify Smart Polling

**1. Open Network Tab in DevTools**

**2. Navigate to ZeroPhase game:**
```
Should see only:
GET /game/123          ✅
GET /game/123/players  ✅
(No votes, commits, rounds polling)
```

**3. Move to CommitPhase:**
```
Should see only:
GET /game/123          ✅
GET /game/123/commits  ✅
GET /game/123/rounds   ✅
(No players or votes polling)
```

**4. Move to RevealPhase:**
```
Should see only:
GET /game/123        ✅
GET /game/123/votes  ✅
GET /game/123/rounds ✅
(No players or commits polling)
```

**5. Move to Completed:**
```
Should see only:
GET /game/123  ✅
(Minimal polling)
```

### Browser Console

Check polling is working:
```javascript
// ZeroPhase - should see Players query polling
// CommitPhase - should see Commits query polling
// RevealPhase - should see Votes query polling
```

---

## Future Optimizations

### Further Improvements Possible

1. **Stop polling `useGame` for Completed games**
   ```typescript
   // In use-game.ts
   case 'Completed':
     return false; // Stop polling entirely
   ```
   Would reduce to **0 requests** for completed games

2. **Server-Sent Events (SSE)**
   - Replace polling with real-time push notifications
   - Instant updates without polling overhead

3. **WebSocket Subscriptions**
   - Subscribe to specific game events
   - Push updates from server → client

4. **Optimistic Updates**
   - Update UI immediately on user action
   - Sync with server in background

---

## Configuration

Smart polling uses the same intervals as before:

```bash
# Development (faster feedback)
NEXT_PUBLIC_POLL_GAME_ACTIVE=10000   # 10s
NEXT_PUBLIC_POLL_GAME_WAITING=15000  # 15s

# Production (bandwidth efficient)
NEXT_PUBLIC_POLL_GAME_ACTIVE=45000   # 45s
NEXT_PUBLIC_POLL_GAME_WAITING=60000  # 60s
```

The difference is now queries only use these intervals **when relevant**.

---

## Summary

Smart polling provides:

✅ **50-67% fewer network requests**
✅ **Lower bandwidth and server costs**
✅ **Better battery life on mobile**
✅ **More efficient resource usage**
✅ **Still responsive** (window focus refetch)
✅ **Simple implementation** (just conditional logic)

By only polling when data can actually change, we maintain responsiveness while dramatically reducing unnecessary network traffic.

---

**Implementation Date**: 2026-01-31
**Status**: ✅ Complete
**Impact**: 50-67% reduction in network requests
