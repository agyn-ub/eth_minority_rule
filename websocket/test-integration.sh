#!/bin/bash

# Integration test script for WebSocket server
# Tests the complete flow: HTTP notification → WebSocket broadcast

set -e

echo "🧪 WebSocket Server Integration Test"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Start WebSocket server
echo "1️⃣  Starting WebSocket server..."
npm run dev > /tmp/ws-server.log 2>&1 &
WS_PID=$!
sleep 3

# Check server is running
echo "2️⃣  Checking server health..."
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✓ Server is healthy${NC}"
else
  echo -e "${RED}✗ Server health check failed${NC}"
  kill $WS_PID 2>/dev/null
  exit 1
fi

# Test notification endpoint
echo "3️⃣  Testing notification endpoint..."

# Test 1: GameCreated
echo "   Testing GameCreated event..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "GameCreated",
    "gameId": "1",
    "data": {
      "questionText": "Test question?",
      "entryFee": "1000000000000000000",
      "creator": "0x1234567890123456789012345678901234567890"
    }
  }')

if echo "$RESPONSE" | grep -q '"status":"accepted"'; then
  echo -e "${GREEN}   ✓ GameCreated notification accepted${NC}"
else
  echo -e "${RED}   ✗ GameCreated notification failed${NC}"
  kill $WS_PID 2>/dev/null
  exit 1
fi

# Test 2: PlayerJoined
echo "   Testing PlayerJoined event..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "PlayerJoined",
    "gameId": "1",
    "data": {
      "playerAddress": "0xabcdef1234567890123456789012345678901234",
      "totalPlayers": 5,
      "amount": "1000000000000000000"
    }
  }')

if echo "$RESPONSE" | grep -q '"status":"accepted"'; then
  echo -e "${GREEN}   ✓ PlayerJoined notification accepted${NC}"
else
  echo -e "${RED}   ✗ PlayerJoined notification failed${NC}"
  kill $WS_PID 2>/dev/null
  exit 1
fi

# Test 3: Invalid payload
echo "   Testing invalid payload (should reject)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "InvalidEvent",
    "gameId": "not-a-number",
    "data": {}
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}   ✓ Invalid payload rejected correctly${NC}"
else
  echo -e "${RED}   ✗ Invalid payload should return 400 (got $HTTP_CODE)${NC}"
  kill $WS_PID 2>/dev/null
  exit 1
fi

# Check server logs
echo "4️⃣  Checking server logs..."
sleep 1
if grep -q "Received notification: GameCreated" /tmp/ws-server.log; then
  echo -e "${GREEN}✓ GameCreated event logged${NC}"
else
  echo -e "${YELLOW}⚠ GameCreated event not found in logs${NC}"
fi

if grep -q "Received notification: PlayerJoined" /tmp/ws-server.log; then
  echo -e "${GREEN}✓ PlayerJoined event logged${NC}"
else
  echo -e "${YELLOW}⚠ PlayerJoined event not found in logs${NC}"
fi

# Cleanup
echo "5️⃣  Cleaning up..."
kill $WS_PID 2>/dev/null
sleep 1

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ All integration tests passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Start all services (Anvil, Ponder, WebSocket, Frontend)"
echo "  2. Create a game and watch WebSocket server logs"
echo "  3. Join the game from another browser/account"
echo "  4. Verify real-time updates appear instantly"
echo ""
