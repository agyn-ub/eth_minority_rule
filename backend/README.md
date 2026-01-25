# Minority Rule Backend

Custom event indexer + WebSocket server for the Minority Rule game.

Replaces Ponder with a lightweight Node.js solution that:
- Listens to blockchain events using **viem**
- Writes directly to PostgreSQL
- Broadcasts real-time updates via **WebSocket**
- Eliminates polling overhead

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
DATABASE_URL=postgresql://...
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS_ANVIL=0x5FbDB2315678afecb367f032d93F642f64180aa3
START_BLOCK_ANVIL=0
PORT=3001
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

## Production

Build and run:
```bash
npm run build
npm start
```

## Architecture

```
Frontend (Next.js)
  ↓
WebSocket Client (subscribes to channels)
  ↓
Backend Server (Fastify)
  ├─ WebSocket Server (/ws)
  ├─ REST API (/health, /metrics)
  └─ Event Listener (viem)
      ├─ Watches 8 contract events
      ├─ Writes to PostgreSQL
      └─ Broadcasts to WebSocket subscribers
          ↓
PostgreSQL (Supabase)
```

## WebSocket Channels

- `global` - All new games
- `game:{id}` - All updates for a specific game
- `game:{id}:round:{n}` - Round-specific updates
- `game:{id}:players` - Player joins

## API Endpoints

- `GET /health` - Health check (database status, WebSocket connections)
- `GET /metrics` - Metrics (uptime, connections)
- `GET /ws` - WebSocket endpoint

## Events Handled

1. `GameCreated` - New game created
2. `PlayerJoined` - Player joins game
3. `VoteCommitted` - Vote committed (hidden)
4. `VoteRevealed` - Vote revealed
5. `CommitPhaseStarted` - Commit phase begins
6. `RevealPhaseStarted` - Reveal phase begins
7. `RoundCompleted` - Round ends, players eliminated
8. `GameCompleted` - Game ends, winners paid

## Database Tables

Uses existing Supabase schema (7 tables):
- `games` - Game metadata
- `players` - Participants
- `votes` - Revealed votes
- `commits` - Vote commitments
- `rounds` - Round results
- `winners` - Prize distribution
- `eliminations` - Elimination tracking

## Deployment

Recommended: [Railway.app](https://railway.app)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push
4. Supports WebSocket out of the box

## Testing Locally

1. Start Anvil: `anvil`
2. Deploy contract (from solidity directory)
3. Start backend: `npm run dev`
4. Connect via WebSocket client or frontend
5. Trigger events by interacting with contract
6. Watch logs for event processing

## Monitoring

Check health:
```bash
curl http://localhost:3001/health
```

Check metrics:
```bash
curl http://localhost:3001/metrics
```

## WebSocket Testing

Use `wscat` to test WebSocket connection:
```bash
npm install -g wscat
wscat -c ws://localhost:3001/ws

# Subscribe to global channel
{"type":"subscribe","channel":"global"}

# Subscribe to specific game
{"type":"subscribe","channel":"game:1"}

# Ping server
{"type":"ping"}
```
