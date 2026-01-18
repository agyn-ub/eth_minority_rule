#!/bin/bash

# ============================================
# Complete Reset Script
# ============================================
# Resets Supabase database, Anvil blockchain,
# and redeploys the fixed contract to the same address
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Complete Reset & Redeploy Script    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Confirm
read -p "⚠️  This will RESET EVERYTHING (Database + Anvil). Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}📋 Step 1: Resetting Supabase Database...${NC}"
cd supabase
supabase db reset --yes
echo -e "${GREEN}✅ Database reset complete${NC}"
echo ""

echo -e "${YELLOW}⚙️  Step 2: Stopping Anvil...${NC}"
ANVIL_PID=$(ps aux | grep 'anvil --state' | grep -v grep | awk '{print $2}')
if [ -z "$ANVIL_PID" ]; then
    echo -e "${BLUE}ℹ️  Anvil not running${NC}"
else
    kill $ANVIL_PID
    echo -e "${GREEN}✅ Anvil stopped (PID: $ANVIL_PID)${NC}"
fi
echo ""

echo -e "${YELLOW}🗑️  Step 3: Deleting Anvil state...${NC}"
cd ..
if [ -f ".anvil-state.json" ]; then
    rm .anvil-state.json
    echo -e "${GREEN}✅ Anvil state deleted${NC}"
else
    echo -e "${BLUE}ℹ️  No Anvil state file found${NC}"
fi
echo ""

echo -e "${YELLOW}🚀 Step 4: Starting Anvil...${NC}"
echo -e "${BLUE}ℹ️  Starting Anvil in background...${NC}"
anvil --state .anvil-state.json > /dev/null 2>&1 &
ANVIL_PID=$!
sleep 2
echo -e "${GREEN}✅ Anvil started (PID: $ANVIL_PID)${NC}"
echo ""

echo -e "${YELLOW}📜 Step 5: Deploying fixed contract...${NC}"
echo -e "${BLUE}ℹ️  Sending dummy transaction to set nonce=1...${NC}"
cast send --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --rpc-url http://127.0.0.1:8545 --value 0 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 > /dev/null 2>&1
cd solidity
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
echo -e "${GREEN}✅ Contract deployed to 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512${NC}"
echo ""

echo -e "${YELLOW}📊 Step 6: Starting Ponder in background...${NC}"
cd ../indexer
npm run dev > ponder.log 2>&1 &
PONDER_PID=$!
echo -e "${GREEN}✅ Ponder started (PID: $PONDER_PID)${NC}"
echo -e "${BLUE}ℹ️  Logs: tail -f indexer/ponder.log${NC}"
echo ""

# Wait for Ponder to initialize
echo -e "${YELLOW}⏳ Waiting for Ponder to initialize (10s)...${NC}"
sleep 10

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Reset Complete! 🎉            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Run simulation: ${YELLOW}cd indexer && npm run simulate:multi-round${NC}"
echo -e "  2. Check Ponder logs: ${YELLOW}tail -f indexer/ponder.log${NC}"
echo -e "  3. View Supabase: ${YELLOW}http://localhost:54323${NC}"
echo ""
echo -e "${YELLOW}Running processes:${NC}"
echo -e "  Anvil PID: ${ANVIL_PID}"
echo -e "  Ponder PID: ${PONDER_PID}"
echo ""
