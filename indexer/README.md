# MinorityRuleGame Indexer

Ponder-based event indexer for the MinorityRuleGame smart contract. Indexes all game events to a Supabase PostgreSQL database for efficient querying by the frontend.

## Features

- ✅ Real-time event indexing from Anvil and Base Sepolia
- ✅ Automatic reorg handling
- ✅ TypeScript with full type safety
- ✅ Hot reload during development
- ✅ Direct PostgreSQL/Supabase integration

## Prerequisites

- Node.js >= 18.0.0
- Supabase project (local or cloud)
- Anvil running locally OR Base Sepolia RPC access
- Deployed MinorityRuleGame contract

## Installation

```bash
npm install
```

## Configuration

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local` with your values:**
   ```bash
   # Database Connection (use local Supabase or cloud)
   DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

   # Contract address (deployed to Anvil)
   CONTRACT_ADDRESS_ANVIL=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

## Development

### 1. Start Supabase (if using local)
```bash
cd ../supabase
supabase start
```

### 2. (Optional) Run User Table Migrations
```bash
# For local Supabase
cd ../supabase
supabase db push

# OR for hosted Supabase
# Run migration in Supabase SQL Editor
```

**Note:** This creates user-specific tables (user_profiles, etc.). Ponder will automatically create blockchain tables (games, players, votes, etc.) when it starts.

### 3. Start Anvil
```bash
cd ../solidity
anvil
```

### 4. Deploy Contract to Anvil
```bash
cd ../solidity
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast

# Copy the deployed contract address and update .env.local
```

### 5. Start Indexer
```bash
npm run dev
```

The indexer will:
- Connect to your database
- Automatically create blockchain tables (games, players, votes, etc.)
- Sync past events from block 0
- Listen for new events in real-time

## Scripts

```bash
# Development mode (hot reload)
npm run dev

# Production mode
npm start

# Generate types
npm run codegen

# Extract ABI from Foundry build
npm run extract-abi

# Run multi-round game simulation (9 players, 2 rounds)
npm run simulate:multi-round
```

## Events Indexed

| Event | Description |
|-------|-------------|
| `GameCreated` | New game created |
| `PlayerJoined` | Player joins game (Round 1 only) |
| `VoteCommitted` | Player commits vote hash |
| `VoteRevealed` | Player reveals vote (builds vote history) |
| `CommitPhaseStarted` | Commit phase begins for a round |
| `RevealPhaseStarted` | Reveal phase begins |
| `RoundCompleted` | Round processed, minority determined |
| `GameCompleted` | Game ended, winners determined |

## Database Schema

See `ponder.schema.ts` for the full schema.

### Blockchain Tables (Created by Ponder):
- **games** - Game state and metadata
- **players** - Player participation
- **votes** - Vote reveals (vote history)
- **commits** - Vote commitments
- **rounds** - Round results
- **winners** - Prize distribution

### User Tables (Created by Supabase migrations):
- **user_profiles** - User display names and profiles

**Note:** Ponder automatically creates and manages blockchain tables. Supabase migrations handle user-specific tables. Both are in the same database and linked by `wallet_address`.

## Monitoring

Watch the console output for indexed events:
```
✅ Game 1 created by 0x...
✅ Player 0x... joined game 1
✅ Vote committed by 0x... for game 1 round 1
✅ Vote revealed by 0x...: YES (game 1 round 1)
✅ Round 1 completed for game 1 | Minority: YES | Remaining: 3
🎉 Game 1 completed! 2 winner(s) | Prize per winner: 1000000000000000000
```

## Querying Data

You can query the indexed data using:

1. **Supabase Studio** (http://localhost:54323 for local)
2. **Direct SQL**:
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM games;"
   ```
3. **Ponder GraphQL API** (if enabled)
4. **Supabase client in frontend**

## Deployment

### Deploy to Railway/Render/Fly.io

1. **Set environment variables:**
   ```bash
   DATABASE_URL=your_supabase_connection_string
   CONTRACT_ADDRESS_BASE_SEPOLIA=0xYourDeployedAddress
   START_BLOCK_BASE_SEPOLIA=12345678
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   ```

2. **Deploy:**
   ```bash
   npm install
   npm start
   ```

## Troubleshooting

### "Cannot find module '@/generated'"
Run `npm run codegen` to generate Ponder types.

### Database connection fails
- Check `DATABASE_URL` is correct
- Ensure Supabase is running (`supabase status`)
- Verify network connectivity

### No events being indexed
- Verify contract address in `.env.local` matches deployment
- Check Anvil is running on port 8545
- Ensure contract has emitted events (create a game)

### Schema mismatch or Ponder errors

**Option 1: Use the reset script (Recommended)**
```bash
./reset-database.sh
```

This script will:
- Drop all Ponder tables (versioned tables with hash prefixes like `5742__games`)
- Drop all Ponder views (`games`, `players`, etc.)
- Drop Ponder metadata (`_ponder_meta`, `ponder_sync` schema)
- Allow Ponder to recreate everything from scratch

**Option 2: Manual Supabase reset**
```bash
# Reset entire Supabase (WARNING: Deletes ALL data including user tables)
cd ../supabase
supabase db reset

# Reapply user table migrations
supabase db push

# Restart indexer (it will recreate blockchain tables)
cd ../indexer
npm run dev
```

**Option 3: SQL Editor (Supabase Dashboard)**
See `reset-database.sql` for the SQL commands, or check `README-reset.md` for detailed instructions.

### Understanding Ponder's Table Structure

Ponder 0.7+ creates versioned tables with hash prefixes:
- **Versioned tables**: `{hash}__tablename` (e.g., `5742__games`, `b2ad__players`)
- **Reorg tables**: `{hash}_reorg__tablename` (for handling chain reorganizations)
- **Views**: `tablename` (points to the current version, e.g., `games` → `5742__games`)

When you reset the database, Ponder will create new hash prefixes, but the views will automatically point to the new tables.

## Architecture

```
┌─────────────┐
│   Anvil/    │
│ Base Sepolia│
│  (Events)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Ponder    │◄─── src/index.ts (Event Handlers)
│   Indexer   │◄─── ponder.config.ts
│             │◄─── ponder.schema.ts (creates blockchain tables)
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│       Supabase Postgres Database     │
├──────────────────────────────────────┤
│ Blockchain Tables (Ponder creates): │
│ - games, players, votes, commits,   │
│   rounds, winners                    │
│                                      │
│ User Tables (Migrations create):    │
│ - user_profiles                      │
│                                      │
│ Linked by: wallet_address           │
└──────────────────────────────────────┘
```

**Key Points:**
- **Ponder manages blockchain tables** automatically from `ponder.schema.ts`
- **Supabase migrations manage user tables** (user_profiles, etc.)
- **Same database, separate concerns** - linked by `wallet_address`

## Next Steps

- Frontend will query this indexed data via Supabase client
- Much faster than querying blockchain directly
- Enables complex queries (filter, sort, search)
- Vote history available instantly

## Testing & Simulation

### Running the Multi-Round Simulation

The project includes a complete game simulation with 9 players across 2 rounds:

```bash
npm run simulate:multi-round
```

This will:
1. Create a new game with your MetaMask account (0xf39F...2266)
2. Have 9 players join and pay 0.1 ETH entry fee each
3. Run Round 1: 4 YES votes, 5 NO votes → 4 survivors
4. Run Round 2: 2 YES votes, 2 NO votes → 2 winners
5. Distribute prizes to winners (0.441 ETH each after 2% platform fee)

Check the Ponder logs to see all events being indexed in real-time!

### Resetting for Fresh Testing

When you want to start completely fresh:

```bash
# 1. Stop Ponder (Ctrl+C)

# 2. Reset database
./reset-database.sh

# 3. Stop Anvil
kill <anvil_pid>

# 4. Delete Anvil state
rm ../.anvil-state.json

# 5. Restart Anvil
cd ../solidity
anvil --state ../.anvil-state.json

# 6. Redeploy contract (will get same address due to deterministic deployment)
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# 7. Restart Ponder
cd ../indexer
npm run dev

# 8. Run simulation
npm run simulate:multi-round
```

See `README-reset.md` for detailed reset instructions.

## Resources

- [Ponder Docs](https://ponder.sh/)
- [Supabase Docs](https://supabase.com/docs)
- [Viem Docs](https://viem.sh/)
