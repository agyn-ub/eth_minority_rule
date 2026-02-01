# WebSocket Quick Start

## Starting the Services

```bash
# Terminal 1: Blockchain
cd solidity && anvil

# Terminal 2: Indexer (with WebSocket notifications)
cd indexer && npm run dev:fresh

# Terminal 3: WebSocket Server (NEW!)
cd websocket && npm run dev

# Terminal 4: Frontend
cd frontend && npm run dev
```

## Testing WebSocket Server

```bash
# Health check
curl http://localhost:3001/health

# Run integration tests
cd websocket && ./test-integration.sh
```

## Enabling Real-Time Updates in Frontend

### Option 1: Game Detail Page (recommended)

```tsx
// app/game/[id]/page.tsx
import { useWebSocketGame } from '@/hooks/websocket/use-websocket-game';

export function GamePage({ params }: { params: { id: string } }) {
  useWebSocketGame(params.id); // ← Add this line

  return <div>Your game UI...</div>;
}
```

### Option 2: Game List Page (optional)

```tsx
// app/games/page.tsx
import { useWebSocketGameList } from '@/hooks/websocket/use-websocket-game-list';

export function GamesPage() {
  useWebSocketGameList('active'); // ← Add this line

  return <div>Your game list...</div>;
}
```

### Option 3: Connection Status Indicator (optional)

```tsx
// components/header.tsx
import { WebSocketStatus } from '@/components/websocket-status';

export function Header() {
  return (
    <header>
      <WebSocketStatus /> {/* Shows green/yellow/red dot */}
    </header>
  );
}
```

## Environment Variables

### Required for Frontend

```bash
# frontend/.env.local
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
```

### Optional for Indexer

```bash
# indexer/.env
WEBSOCKET_API_URL=http://localhost:3001/api/notify
# DISABLE_WEBSOCKET=true  # Uncomment to disable
```

### Optional for WebSocket Server

```bash
# websocket/.env
PORT=3001
LOG_LEVEL=info
```

## Verifying It Works

1. **Start all services** (see "Starting the Services" above)

2. **Open two browsers:**
   - Browser 1: http://localhost:3000/game/1
   - Browser 2: http://localhost:3000/game/1 (different account)

3. **Create a game** in Browser 1

4. **Join the game** in Browser 2

5. **Check Browser 1**: You should see the new player appear **instantly** (< 1 second)

6. **Check WebSocket logs**: You should see:
   ```
   [INFO] Received notification: PlayerJoined {"gameId":"1"}
   [INFO] Broadcast to game:1 (successCount: 2)
   ```

## Troubleshooting

### WebSocket server not starting

```bash
# Check if port 3001 is available
lsof -i :3001

# Kill any process using the port
kill -9 <PID>
```

### Events not being received

```bash
# Check WebSocket connection in browser DevTools
# Network tab → WS → Click connection → Messages tab

# Should see:
# {"type":"subscribed","gameId":"1"}
# {"type":"event","eventType":"PlayerJoined",...}
```

### Ponder not sending notifications

```bash
# Check Ponder logs for:
# "✅ WebSocket notified: PlayerJoined"

# If you see "⚠️ WebSocket notification failed":
# - Check WebSocket server is running
# - Check WEBSOCKET_API_URL is correct
```

## What Events Trigger Updates?

All these events trigger instant UI updates:

- ✅ GameCreated
- ✅ PlayerJoined
- ✅ VoteCommitted
- ✅ VoteRevealed
- ✅ CommitPhaseStarted
- ✅ RevealPhaseStarted
- ✅ RoundCompleted
- ✅ GameCompleted

## Performance

- **Latency**: < 50ms from blockchain event to UI update
- **No extra polling**: WebSocket reduces unnecessary API calls
- **Fallback**: Still uses polling if WebSocket fails (reliable!)

## Production Deployment

```bash
# Build WebSocket server
cd websocket && npm run build

# Run with PM2
pm2 start dist/server.js --name websocket-server

# Update frontend env
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-server.com
```

## Disabling WebSocket (if needed)

```bash
# Option 1: Don't start the server
# (Frontend will use polling)

# Option 2: Disable in Ponder
# indexer/.env
DISABLE_WEBSOCKET=true

# Option 3: Don't use the hooks
# (Just don't call useWebSocketGame in your components)
```

## More Information

- `websocket/README.md` - Detailed server documentation
- `WEBSOCKET_INTEGRATION_GUIDE.md` - Frontend integration guide
- `WEBSOCKET_IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- `CLAUDE.md` - Updated project documentation

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs: `tail -f /tmp/ws-server.log`
3. Check browser console for errors
4. Verify all environment variables are set correctly
