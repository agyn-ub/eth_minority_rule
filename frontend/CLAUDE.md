# Frontend - Minority Rule Game

This is the frontend for the Minority Rule Game, a blockchain-based game where players vote YES or NO and the minority wins. Built with Next.js, React, Wagmi, and Supabase.

## Developer Role & Standards

You are a **senior frontend engineer** specializing in modern web applications with blockchain integration.

### Technical Expertise
- **Core Stack**: Next.js 14 (App Router), React 18, TypeScript (strict mode), Tailwind CSS
- **JavaScript Mastery**: Deep understanding of JavaScript fundamentals (You Don't Know JS Yet - 2nd Edition)
- **Web3**: Proficient with Wagmi v2, Viem, and Ethereum development patterns
- **State Management**: Expert in React Query (@tanstack/react-query) for server state

### Code Quality Principles
1. **Performance First**
   - Write efficient, high-performance React code
   - Prevent memory leaks through proper cleanup and dependency management
   - Optimize re-renders using memoization only when necessary
   - Leverage React Query caching and invalidation patterns

2. **React Best Practices**
   - Avoid common pitfalls: stale closures, infinite loops, improper useEffect usage
   - Use proper dependency arrays and cleanup functions
   - Prefer composition over prop drilling
   - Keep components focused and single-responsibility

3. **Code Simplicity**
   - Write clear, maintainable code over clever solutions
   - Follow existing patterns and conventions in the codebase
   - Use TypeScript for type safety, not just type annotations
   - Avoid premature optimization and over-engineering

4. **Modern React Patterns**
   - Leverage hooks effectively (useState, useEffect, useMemo, useCallback)
   - Use React Server Components where appropriate
   - Handle loading and error states gracefully
   - Implement proper form validation and user feedback

### Development Approach
- **Read before modifying**: Always understand existing code before making changes
- **Consistency**: Follow established patterns in this codebase
- **Testing mindset**: Consider edge cases and error scenarios
- **Performance awareness**: Monitor bundle size, avoid unnecessary re-renders, optimize queries

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Prerequisites

- **Local blockchain**: Foundry/Anvil running at `http://127.0.0.1:8545` (chain ID 31337)
- **MetaMask**: Connected to localhost:8545 with imported Anvil test accounts
- **Supabase**: Environment variables set (see `.env.local`)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom "Liar Game" aesthetic
- **Blockchain**: Wagmi v2 + Viem for Web3
- **State**: React Query (@tanstack/react-query) for all data fetching
- **Database**: Supabase for off-chain game data
- **UI Components**: shadcn/ui (Radix UI primitives)

### Path Alias
- `@/*` maps to `./src/*`

## Blockchain Integration

### Contract Setup
- **Contract**: MinorityRuleGame
- **Local Development**:
  - Chain ID: 31337 (Foundry/Anvil)
  - RPC: `http://127.0.0.1:8545`
  - Default address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Testnets**: Base Sepolia (84532), Base Mainnet (8453)

### Wagmi Configuration
- Location: `src/lib/wagmi.ts`
- Chains: Foundry (local), Base Sepolia, Base Mainnet
- Connectors: Injected (MetaMask)
- SSR enabled for Next.js

### Contract Helpers
- Location: `src/lib/contracts.ts`
- `CONTRACTS` object with addresses per chain ID
- `getContractAddress(chainId)` helper
- `MinorityRuleGameAbi` imported from JSON

### Transaction Pattern
```typescript
// 1. Write to contract
const { writeContract } = useWriteContract();
writeContract({ ... });

// 2. Wait for transaction receipt
const { isSuccess } = useWaitForTransactionReceipt({ hash });

// 3. Invalidate cache after success
const { invalidateGame } = useGameMutations();
if (isSuccess) {
  await invalidateGame(gameId);
}
```

## State Management

### React Query Architecture
All data fetching uses React Query with:
- **Query key factory**: `src/lib/query-keys.ts` for type-safe cache management
- **Required polling configuration**: `src/lib/polling-config.ts` centralizes all polling intervals
  - All core intervals MUST be explicitly configured via environment variables
  - App will crash with clear error messages if required variables are missing
  - Recommended: 45-90s for production (bandwidth efficient), 10-15s for development (quick feedback)
  - Active phases (CommitPhase/RevealPhase): Configurable via `NEXT_PUBLIC_POLL_GAME_ACTIVE`
  - Waiting phase (ZeroPhase): Configurable via `NEXT_PUBLIC_POLL_GAME_WAITING`
  - Completed: Configurable via `NEXT_PUBLIC_POLL_GAME_COMPLETED` (recommend: false)
  - Game lists: Configurable via `NEXT_PUBLIC_POLL_GAMES_ACTIVE` and `NEXT_PUBLIC_POLL_GAMES_COMPLETED`
- **Adaptive polling**: Primary queries (`useGame`) adjust intervals based on game state
- **Supporting queries**: No independent polling (rely on cache invalidation + window focus)
- **Cache invalidation**: Via `useGameMutations()` hook after blockchain writes

### Supabase Integration
- Client: `src/lib/supabase.ts`
- Type-safe query helpers for all tables:
  - `games`, `players`, `votes`, `commits`, `rounds`, `winners`
- All addresses normalized to lowercase for consistency
- BigInt values stored as strings (e.g., `game_id`, `entry_fee`, `prize_pool`)

### Query Hooks Pattern
Location: `src/hooks/queries/`
- `useGame(gameId)` - Single game with adaptive polling
- `useGameDetail(gameId)` - Comprehensive hook fetching all game data
- `useGamePlayers(gameId)` - Game participants
- `useGameVotes(gameId, round?)` - Vote history
- `useGameRounds(gameId)` - Round results
- `usePlayerStats(address)` - Player statistics

### Mutation Helpers
Location: `src/hooks/mutations/use-game-mutations.ts`
- `invalidateGame(gameId)` - Invalidate all data for a specific game
- `invalidateGameLists()` - Invalidate active/completed game lists
- `optimisticUpdateGame()` - Update cache before server confirms

### Polling Architecture Deep Dive

The application uses a hierarchical polling strategy to minimize network requests while keeping data fresh.

#### Configuration (`src/lib/polling-config.ts`)
- **Explicit configuration required**: All core polling intervals must be set via environment variables
- **No automatic defaults**: App will crash if required variables are missing (prevents accidental misconfigurations)
- **Centralized management**: All polling logic in one place for easy tuning
- **Validation**: Min 1000ms (1 second), Max 300000ms (5 minutes), or "false" to disable

#### Query Hierarchy
```
Primary Query (useGame)
  ├─ Adaptive polling based on game state
  ├─ Polls every 10-60 seconds depending on state
  └─ On update: Invalidates cache for all related queries
      │
      ├─ useGamePlayers (NO polling)
      ├─ useGameVotes (NO polling)
      ├─ useGameCommits (NO polling)
      ├─ useGameRounds (NO polling)
      └─ useGameWinners (NO polling)
          └─ All refetch on window focus
```

#### Why Supporting Queries Don't Poll
1. **Efficiency**: Prevents redundant requests for related data
2. **Shared cache**: When `useGame` updates, related queries see new data automatically
3. **Window focus**: Manual refresh when user returns to tab ensures freshness
4. **Cache invalidation**: After blockchain writes, all related queries refetch

#### Environment Variables
All polling intervals are REQUIRED and must be explicitly configured:

```bash
# Required: Core polling intervals (app will crash if not set)
NEXT_PUBLIC_POLL_GAME_ACTIVE=45000        # Active phases (CommitPhase/RevealPhase)
NEXT_PUBLIC_POLL_GAME_WAITING=60000       # Waiting phase (ZeroPhase)
NEXT_PUBLIC_POLL_GAME_COMPLETED=false     # Completed games (recommend: false)
NEXT_PUBLIC_POLL_GAMES_ACTIVE=45000       # Active games list
NEXT_PUBLIC_POLL_GAMES_COMPLETED=90000    # Completed games list

# Optional: Fine-grained control (falls back to main intervals if not set)
NEXT_PUBLIC_POLL_GAME_PLAYERS=60000       # Overrides POLL_GAME_WAITING
NEXT_PUBLIC_POLL_GAME_COMMITS=45000       # Overrides POLL_GAME_ACTIVE
NEXT_PUBLIC_POLL_GAME_VOTES=45000         # Overrides POLL_GAME_ACTIVE
NEXT_PUBLIC_POLL_GAME_ROUNDS=45000        # Overrides POLL_GAME_ACTIVE

# Recommended values:
# - Development: 10000-15000ms for quick feedback
# - Production: 45000-90000ms for bandwidth efficiency
# - Set to "false" to disable polling
```

#### Performance Considerations
- `refetchIntervalInBackground: false` - Stops polling when tab is hidden
- `gcTime` - Cleans up unused cache entries after 90-120 seconds
- `placeholderData` - Keeps previous data visible while refetching (no loading flicker)
- `staleTime` - Matches polling intervals to avoid unnecessary refetches

## Component Patterns

### Directory Structure
```
src/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx           # Home: Active games
│   ├── game/[id]/         # Game detail page
│   ├── players/           # Player search
│   ├── player/[address]/  # Player profile
│   ├── my-games/          # Created games
│   ├── how-it-works/      # Game rules
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # Wagmi + React Query providers
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── ConnectButton.tsx # Wallet connection
│   ├── CreateGameModal.tsx
│   ├── GameCard.tsx      # Game list item
│   ├── JoinGameForm.tsx
│   ├── VoteCommitForm.tsx
│   ├── VoteRevealForm.tsx
│   ├── ProcessRoundForm.tsx
│   ├── GameConfigForm.tsx
│   ├── TimerProgress.tsx
│   └── PlayerSearchBar.tsx
├── hooks/
│   ├── queries/          # React Query hooks
│   ├── mutations/        # Cache invalidation
│   ├── use-toast.ts      # Toast notifications
│   └── use-debounce.ts   # Input debouncing
├── lib/
│   ├── wagmi.ts         # Blockchain config
│   ├── contracts.ts     # Contract ABI/addresses
│   ├── supabase.ts      # Database queries + types
│   ├── query-keys.ts    # React Query key factory
│   └── utils.ts         # Helper functions
└── types/               # TypeScript definitions
```

### Component Guidelines
- **Client components**: Add `'use client'` directive for interactivity
- **Class composition**: Use `cn()` utility (clsx + tailwind-merge)
- **Variants**: Use CVA (class-variance-authority) for component variants
- **shadcn/ui**: Pre-built components in `components/ui/`

## Key Utilities

Location: `src/lib/utils.ts`

```typescript
cn(...classes)                 // Merge Tailwind classes
formatAddress(address)         // "0x1234...5678"
formatWei(wei)                 // BigInt → ETH string
parseEth(eth)                  // ETH string → BigInt
formatTimestamp(timestamp)     // Unix → locale string
getTimeRemaining(deadline)     // Unix → "5h 30m"
getGameStateLabel(state)       // "CommitPhase" → "Commit Phase"
getGameStateColor(state)       // State → Tailwind bg-color class
```

## Important Patterns

### Address Handling
- Always use `formatAddress()` for display
- Normalize to lowercase for database queries
- Use viem's `Address` type for type safety

### Wei/ETH Conversion
- Use viem's `formatEther()` and `parseEther()` via wrappers
- All BigInt values stored as strings in Supabase
- Convert strings to BigInt: `BigInt(value)`

### Game State Colors
- Use `getGameStateColor(state)` for consistency
- Colors: ZeroPhase (gray), CommitPhase (blue), RevealPhase (yellow), Completed (green)

### Error Handling
- Parse contract errors from wagmi error messages
- Display user-friendly error messages via toast
- Handle missing data gracefully (nullish coalescing)

### Vote Salt Management
- Salts stored in localStorage with key format: `vote-salt-${gameId}-${round}`
- Backup/restore functionality available
- Critical: Losing salt means unable to reveal vote

### Cache Invalidation Strategy
1. After successful transaction receipt
2. Call appropriate `invalidate*()` method from `useGameMutations()`
3. React Query automatically refetches data
4. UI updates with new blockchain state

## Development Workflow

### Local Setup
1. Start Anvil: `anvil` (in contract directory)
2. Deploy contract: `forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545`
3. Update `NEXT_PUBLIC_CONTRACT_ADDRESS_ANVIL` in `.env.local` if needed
4. Start frontend: `npm run dev`
5. Connect MetaMask to localhost:8545
6. Import Anvil test account (check Anvil output for private keys)

### Environment Variables

**Required** in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CONTRACT_ADDRESS_ANVIL=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CONTRACT_ADDRESS_BASE_SEPOLIA=...
NEXT_PUBLIC_CONTRACT_ADDRESS_BASE=...

# Required: Polling intervals (milliseconds or "false" to disable)
NEXT_PUBLIC_POLL_GAME_ACTIVE=45000
NEXT_PUBLIC_POLL_GAME_WAITING=60000
NEXT_PUBLIC_POLL_GAME_COMPLETED=false
NEXT_PUBLIC_POLL_GAMES_ACTIVE=45000
NEXT_PUBLIC_POLL_GAMES_COMPLETED=90000
```

See `.env.example` for complete list and recommended values.

**Note**: Previous versions auto-configured polling intervals based on NODE_ENV. This has been removed to ensure explicit configuration. The app will crash with clear error messages if required variables are missing.

### Testing Locally
1. Create game with test account
2. Join game with different test accounts
3. Set deadlines (use `InlineDeadlineForm` on settings page)
4. Commit votes during CommitPhase
5. Reveal votes during RevealPhase (requires salt from localStorage)
6. Process round to eliminate players
7. Repeat until one player remains (winner)

## Data Flow Example

Creating and joining a game:

```
1. User clicks "Create Game" → CreateGameModal
2. Submit form → writeContract(createGame)
3. Wait for receipt → useWaitForTransactionReceipt
4. On success → invalidateGameLists()
5. Ponder indexes event → updates Supabase
6. React Query refetches → UI updates with new game
7. User navigates to game detail → useGameDetail(gameId)
8. Other user clicks "Join" → JoinGameForm
9. Submit → writeContract(joinGame)
10. On success → invalidateGame(gameId)
11. Ponder indexes → Supabase updated
12. Adaptive polling (10-60s dev, 45-60s prod) → UI shows new player
```

## Common Tasks

### Adding a New Game State
1. Update contract ABI if needed
2. Add state to `getGameStateLabel()` in `utils.ts`
3. Add color to `getGameStateColor()` in `utils.ts`
4. Update UI components to handle new state

### Adding a New Supabase Query
1. Define TypeScript interface in `lib/supabase.ts`
2. Create query function (follow existing patterns)
3. Add query key to `lib/query-keys.ts`
4. Create React Query hook in `hooks/queries/`
5. Use hook in component

### Adding a New Transaction
1. Create form component (follow `VoteCommitForm.tsx` pattern)
2. Use `useWriteContract` hook
3. Use `useWaitForTransactionReceipt` to wait for confirmation
4. Call `invalidateGame()` or `invalidateGameLists()` on success
5. Show success/error toast

## Styling

### Tailwind Configuration
- Custom theme in `tailwind.config.js`
- "Liar Game" aesthetic: Dark backgrounds, red accents, high contrast
- CSS variables in `app/globals.css`

### Color Scheme
- Background: Dark grays/blacks
- Primary: Red (#dc2626, #991b1b)
- Accents: Yellow/gold for emphasis
- Cards: Subtle borders with dark backgrounds

### Component Styling
- Use Tailwind utility classes
- Compose classes with `cn()` utility
- Follow shadcn/ui patterns for consistency
- Responsive: Mobile-first approach

## Performance Considerations

### Query Optimization
- Adaptive polling reduces unnecessary requests
- `placeholderData` keeps UI stable during refetches
- Selective invalidation (only affected queries)
- Query keys follow hierarchy for granular cache control

### Bundle Size
- Next.js automatic code splitting
- Dynamic imports for heavy components (if needed)
- Tree-shaking via ES modules

### Blockchain Performance
- Batch reads when possible
- Use `multicall` for multiple contract reads (if needed)
- Cache transaction hashes to avoid duplicate submissions

## Troubleshooting

### Common Issues

**"Wrong network"**: Switch MetaMask to localhost:8545 (chain ID 31337)

**"Contract not found"**: Redeploy contract or check address in `.env.local`

**"Cannot reveal vote"**: Salt not found in localStorage - backup/restore or wait for next round

**"Transaction failed"**: Check contract state (e.g., can't vote outside commit phase)

**"Data not updating"**: Check Ponder indexer is running and processing events

**"Supabase errors"**: Verify environment variables and Supabase project is active

## Key Files to Understand

Priority reading order for new developers:
1. `src/lib/wagmi.ts` - Blockchain setup
2. `src/lib/contracts.ts` - Contract integration
3. `src/lib/supabase.ts` - Database schema + queries
4. `src/lib/query-keys.ts` - Cache structure
5. `src/hooks/queries/use-game.ts` - Data fetching pattern
6. `src/hooks/mutations/use-game-mutations.ts` - Cache invalidation
7. `src/components/VoteCommitForm.tsx` - Transaction pattern example
8. `src/app/game/[id]/page.tsx` - Full page example

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Wagmi Docs**: https://wagmi.sh
- **Viem Docs**: https://viem.sh
- **React Query Docs**: https://tanstack.com/query
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
