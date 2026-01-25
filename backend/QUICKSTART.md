# Backend Quick Start Guide

## ✅ What's Been Implemented

The custom event indexer + WebSocket server is fully implemented with:

### Infrastructure
- ✅ Fastify HTTP server with WebSocket support
- ✅ PostgreSQL connection pooling
- ✅ Viem event listeners (8 contract events)
- ✅ WebSocket room-based subscriptions
- ✅ Structured logging with Pino
- ✅ Health check and metrics endpoints

### Event Handlers (All 8 Events)
- ✅ `GameCreated` - Creates game in database
- ✅ `PlayerJoined` - Adds player, updates game state
- ✅ `VoteCommitted` - Records vote commitment
- ✅ `VoteRevealed` - Records revealed vote
- ✅ `CommitPhaseStarted` - Updates game phase
- ✅ `RevealPhaseStarted` - Updates game phase
- ✅ `RoundCompleted` - **Complex elimination logic** (matches Ponder exactly)
- ✅ `GameCompleted` - Finalizes game, records winners

### Features
- Transaction safety with PostgreSQL BEGIN/COMMIT/ROLLBACK
- WebSocket broadcasting to multiple channels per event
- Automatic reconnection detection (heartbeat/ping-pong)
- Graceful shutdown handling
- TypeScript compilation to JavaScript

## 🚀 Running the Backend

### Prerequisites
1. **Anvil running**: `anvil` in the solidity directory
2. **Contract deployed**: Contract address in `.env`
3. **Supabase/PostgreSQL**: Database URL in `.env`

### Start Development Server
```bash
cd backend
npm run dev
```

You should see:
```
[INFO] Checking database connection...
[INFO] Database connection successful
[INFO] Starting event listener...
[INFO] Event listener started successfully - watching all 8 events
[INFO] Server listening on port 3001
[INFO] WebSocket available at ws://localhost:3001/ws
[INFO] Health check at http://localhost:3001/health
[INFO] Metrics at http://localhost:3001/metrics
```

### Test Health Endpoint
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1706206800000,
  "database": "up",
  "websocketConnections": 0
}
```

## 🧪 Testing with WebSocket

### Install wscat (if needed)
```bash
npm install -g wscat
```

### Connect and Subscribe
```bash
wscat -c ws://localhost:3001/ws
```

Commands:
```json
# Subscribe to all new games
{"type":"subscribe","channel":"global"}

# Subscribe to specific game
{"type":"subscribe","channel":"game:1"}

# Subscribe to specific round
{"type":"subscribe","channel":"game:1:round:1"}

# Ping server
{"type":"ping"}

# Unsubscribe
{"type":"unsubscribe","channel":"global"}
```

## 📊 WebSocket Message Format

### Client → Server (Subscribe)
```json
{
  "type": "subscribe",
  "channel": "game:123"
}
```

### Server → Client (Event)
```json
{
  "type": "event",
  "channel": "game:123",
  "event": "PlayerJoined",
  "data": {
    "gameId": "123",
    "player": "0x1234...",
    "amount": "1000000000000000000",
    "totalPlayers": 3
  },
  "timestamp": 1706206800000
}
```

### Server → Client (Confirmation)
```json
{
  "type": "subscribed",
  "channel": "game:123"
}
```

## 🔄 Parallel Testing with Ponder

You can run **both** Ponder and the new backend simultaneously:

1. **Start Ponder** (in indexer directory):
   ```bash
   cd ../indexer
   npm run dev
   ```

2. **Start Backend** (in backend directory):
   ```bash
   cd ../backend
   npm run dev
   ```

Both will:
- Listen to the same blockchain events
- Write to the same PostgreSQL database
- PostgreSQL constraints prevent duplicate rows
- You can compare behavior side-by-side

## 📝 Next Steps

### 1. Test Event Processing
Trigger events by interacting with the contract:
```bash
# In solidity directory
cast send $CONTRACT_ADDRESS "createGame(string,uint256)" "Test?" 100000000000000000 --private-key $PRIVATE_KEY
```

Watch logs in backend terminal to see events processed.

### 2. Frontend Integration
Once backend is stable:
- Add WebSocket client to frontend
- Subscribe to game channels
- Remove polling intervals
- Trigger cache invalidation on WebSocket events

### 3. Production Deployment
Deploy to Railway.app:
1. Push to GitHub
2. Connect Railway to repo
3. Set environment variables
4. Deploy automatically

## 🐛 Troubleshooting

### "Database connection failed"
- Check DATABASE_URL in `.env`
- Ensure Supabase is running (local or cloud)

### "Contract not found" or no events
- Check CONTRACT_ADDRESS_ANVIL in `.env`
- Ensure Anvil is running
- Verify contract is deployed

### WebSocket not connecting
- Check firewall settings
- Ensure port 3001 is available
- Try `ws://` not `wss://` for local

### Events not processing
- Check logs for errors
- Verify START_BLOCK_ANVIL is correct
- Ensure RPC_URL points to Anvil

## 📦 Project Structure

```
backend/
├── src/
│   ├── server.ts              # Entry point
│   ├── config.ts              # Environment config
│   ├── db/
│   │   └── client.ts          # PostgreSQL pool
│   ├── events/
│   │   ├── listener.ts        # Viem event watcher
│   │   └── handlers/          # 8 event handlers
│   │       ├── game-created.ts
│   │       ├── player-joined.ts
│   │       ├── vote-committed.ts
│   │       ├── vote-revealed.ts
│   │       ├── commit-phase-started.ts
│   │       ├── reveal-phase-started.ts
│   │       ├── round-completed.ts  # MOST COMPLEX
│   │       └── game-completed.ts
│   ├── websocket/
│   │   ├── server.ts          # WebSocket setup
│   │   ├── rooms.ts           # Subscription management
│   │   └── broadcaster.ts     # Message broadcasting
│   ├── api/
│   │   └── routes.ts          # /health, /metrics
│   └── utils/
│       ├── logger.ts          # Pino logger
│       └── types.ts           # TypeScript types
├── abis/
│   └── MinorityRuleGame.json  # Contract ABI
├── package.json
├── tsconfig.json
├── .env                        # Environment variables
└── README.md

Built output: dist/
```

## ✨ Key Features

### RoundCompleted Handler (Critical)
The most complex handler that replicates Ponder's elimination logic:

1. Inserts round result into `rounds` table
2. Fetches all votes for the round
3. **Determines eliminated players**: Filters votes where `vote !== minorityVote`
4. Updates `eliminations` table for each eliminated player
5. Updates game state: `ZeroPhase`, clears deadlines, increments round
6. Broadcasts to WebSocket subscribers

**All operations wrapped in PostgreSQL transaction for safety.**

### Transaction Safety
Every event handler:
```typescript
const client = await db.connect();
try {
  await client.query('BEGIN');
  // ... database operations
  await client.query('COMMIT');
  // ... websocket broadcast
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### WebSocket Channels
- `global` - All game creations
- `game:{gameId}` - All updates for a game
- `game:{gameId}:round:{round}` - Round-specific updates
- `game:{gameId}:players` - Player joins

## 🎯 Performance Expectations

- **Event processing**: < 100ms per event
- **WebSocket latency**: < 50ms
- **Database connections**: Pool of 20
- **Polling interval**: 1 second (Anvil)
- **Memory usage**: ~50-100MB

## 📈 Monitoring

Watch logs for:
- `GameCreated event processed` - Successful game creation
- `PlayerJoined event processed` - Successful join
- `Round completed - processing eliminations` - Elimination logic running
- `Broadcast complete` - WebSocket messages sent
- `Client subscribed` / `Client unsubscribed` - Connection activity

## 🔐 Security Notes

- All player addresses normalized to lowercase
- PostgreSQL constraints prevent duplicate events
- WebSocket heartbeat detects stale connections (30s)
- Graceful shutdown on SIGTERM/SIGINT
- No sensitive data logged

## 🚢 Production Checklist

Before deploying:
- [ ] Update RPC_URL to production endpoint
- [ ] Update CONTRACT_ADDRESS to production contract
- [ ] Set DATABASE_URL to production database
- [ ] Set START_BLOCK to contract deployment block
- [ ] Set NODE_ENV=production
- [ ] Set LOG_LEVEL=info or warn
- [ ] Increase confirmations (1 for Anvil, 3-5 for production)
- [ ] Test WebSocket under load
- [ ] Set up monitoring/alerting

---

**You're ready to go!** Run `npm run dev` and start testing. 🎉
