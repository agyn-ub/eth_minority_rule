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

### 2. Start Anvil
```bash
cd ../solidity
anvil
```

### 3. Deploy Contract to Anvil
```bash
cd ../solidity
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast

# Copy the deployed contract address and update .env.local
```

### 4. Start Indexer
```bash
npm run dev
```

The indexer will:
- Connect to your database
- Create/update tables based on `ponder.schema.ts`
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

See `ponder.schema.ts` for the full schema. Key tables:

- **Game** - Game state and metadata
- **Player** - Player participation
- **Vote** - Vote reveals (vote history)
- **Commit** - Vote commitments
- **Round** - Round results
- **Winner** - Prize distribution

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
   psql $DATABASE_URL -c "SELECT * FROM \"Game\";"
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

### Schema mismatch
```bash
# Ponder will auto-migrate, but you can reset:
supabase db reset
npm run dev
```

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
│             │◄─── ponder.schema.ts
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │◄─── PostgreSQL Database
│  Postgres   │     (Indexed Game Data)
└─────────────┘
```

## Next Steps

- Frontend will query this indexed data via Supabase client
- Much faster than querying blockchain directly
- Enables complex queries (filter, sort, search)
- Vote history available instantly

## Resources

- [Ponder Docs](https://ponder.sh/)
- [Supabase Docs](https://supabase.com/docs)
- [Viem Docs](https://viem.sh/)
