#!/bin/bash

# Local development startup script
# Starts: Supabase, Anvil, deploys contract, Indexer, WebSocket server
# Usage: ./dev.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "Shutting down all services..."
  kill $ANVIL_PID $INDEXER_PID $WS_PID 2>/dev/null
  wait $ANVIL_PID $INDEXER_PID $WS_PID 2>/dev/null
  echo "All services stopped. (Supabase still running — use 'supabase stop' to stop it)"
  exit 0
}

trap cleanup SIGINT SIGTERM

# 1. Check Supabase / Docker
echo "==> Checking Supabase..."
cd "$ROOT_DIR/supabase"
if ! supabase status > /dev/null 2>&1; then
  echo "==> Starting Supabase (requires Docker)..."
  supabase start || { echo "ERROR: Failed to start Supabase. Is Docker running?"; exit 1; }
else
  echo "==> Supabase already running."
fi

# 2. Start Anvil
echo "==> Starting Anvil..."
cd "$ROOT_DIR/solidity"
anvil 2>&1 | sed -u 's/^/[anvil] /' &
ANVIL_PID=$!
sleep 2

# 3. Deploy contract from Anvil Account 0 (deterministic address)
echo "==> Deploying contract from Anvil Account 0..."
# Anvil Account 0 private key - always deploys to 0x5FbDB2315678afecb367f032d93F642f64180aa3
ANVIL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEPLOY_OUTPUT=$(PRIVATE_KEY=$ANVIL_PRIVATE_KEY forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545 2>&1)
echo "$DEPLOY_OUTPUT" | sed 's/^/[deploy] /'

CONTRACT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "MinorityRuleGame deployed to:" | grep -oE '0x[a-fA-F0-9]{40}')
if [ -z "$CONTRACT_ADDR" ]; then
  echo "ERROR: Could not extract contract address from deploy output"
  kill $ANVIL_PID 2>/dev/null
  exit 1
fi
echo "==> Contract deployed at: $CONTRACT_ADDR"

# 4. Update .env files with deployed address
sed -i '' "s|^CONTRACT_ADDRESS_ANVIL=.*|CONTRACT_ADDRESS_ANVIL=$CONTRACT_ADDR|" "$ROOT_DIR/indexer/.env"
sed -i '' "s|^NEXT_PUBLIC_CONTRACT_ADDRESS_ANVIL=.*|NEXT_PUBLIC_CONTRACT_ADDRESS_ANVIL=$CONTRACT_ADDR|" "$ROOT_DIR/frontend/.env.local"
echo "==> Updated indexer/.env and frontend/.env.local with contract address"

# 5. Start Indexer (fresh)
echo "==> Starting Indexer..."
cd "$ROOT_DIR/indexer"
npm run dev:fresh 2>&1 | sed -u 's/^/[indexer] /' &
INDEXER_PID=$!

# 6. Start WebSocket server
echo "==> Starting WebSocket server..."
cd "$ROOT_DIR/websocket"
npm run dev 2>&1 | sed -u 's/^/[ws] /' &
WS_PID=$!

sleep 3
echo ""
echo "========================================"
echo " All services running"
echo "========================================"
echo " Supabase DB: localhost:54322"
echo " Anvil:       http://localhost:8545"
echo " Indexer:     http://localhost:42069/graphql"
echo " WebSocket:   http://localhost:3001"
echo " Contract:    $CONTRACT_ADDR"
echo ""
echo " Frontend:    cd frontend && npm run dev"
echo ""
echo " Press Ctrl+C to stop (keeps Supabase running)"
echo "========================================"

wait
