#!/bin/bash

# Verification script for WebSocket implementation
# Checks that all files are in place and properly configured

echo "🔍 WebSocket Implementation Verification"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
  else
    echo -e "${RED}✗${NC} $1 (missing)"
    ERRORS=$((ERRORS + 1))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
  else
    echo -e "${RED}✗${NC} $1/ (missing)"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "📁 Checking directories..."
check_dir "websocket"
check_dir "websocket/src"
check_dir "websocket/src/utils"
check_dir "frontend/src/lib/websocket"
check_dir "frontend/src/hooks/websocket"
echo ""

echo "📄 Checking WebSocket server files..."
check_file "websocket/package.json"
check_file "websocket/tsconfig.json"
check_file "websocket/.env.example"
check_file "websocket/.gitignore"
check_file "websocket/README.md"
check_file "websocket/test-integration.sh"
check_file "websocket/src/server.ts"
check_file "websocket/src/http-api.ts"
check_file "websocket/src/websocket-handler.ts"
check_file "websocket/src/room-manager.ts"
check_file "websocket/src/types.ts"
check_file "websocket/src/utils/logger.ts"
check_file "websocket/src/utils/validation.ts"
echo ""

echo "📄 Checking Ponder integration files..."
check_file "indexer/src/utils/websocket-notifier.ts"
echo ""

echo "📄 Checking frontend files..."
check_file "frontend/src/lib/websocket/client.ts"
check_file "frontend/src/lib/websocket/types.ts"
check_file "frontend/src/lib/websocket/config.ts"
check_file "frontend/src/hooks/websocket/use-websocket-game.ts"
check_file "frontend/src/hooks/websocket/use-websocket-connection.ts"
check_file "frontend/src/hooks/websocket/use-websocket-game-list.ts"
check_file "frontend/src/components/websocket-status.tsx"
check_file "frontend/.env.local.example"
echo ""

echo "📄 Checking documentation files..."
check_file "WEBSOCKET_QUICKSTART.md"
check_file "WEBSOCKET_INTEGRATION_GUIDE.md"
check_file "WEBSOCKET_IMPLEMENTATION_SUMMARY.md"
echo ""

echo "🔧 Checking dependencies..."
if [ -d "websocket/node_modules" ]; then
  echo -e "${GREEN}✓${NC} WebSocket dependencies installed"
else
  echo -e "${YELLOW}⚠${NC} WebSocket dependencies not installed (run: cd websocket && npm install)"
fi
echo ""

echo "🏗️  Checking build status..."
if [ -d "websocket/dist" ]; then
  echo -e "${GREEN}✓${NC} WebSocket server built"
else
  echo -e "${YELLOW}⚠${NC} WebSocket server not built (run: cd websocket && npm run build)"
fi
echo ""

echo "🔍 Checking for WebSocket integration in Ponder..."
if grep -q "import { notifyWebSocket }" indexer/src/index.ts 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Ponder imports websocket-notifier"
else
  echo -e "${RED}✗${NC} Ponder missing websocket-notifier import"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "notifyWebSocket(" indexer/src/index.ts 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Ponder calls notifyWebSocket"
else
  echo -e "${RED}✗${NC} Ponder missing notifyWebSocket calls"
  ERRORS=$((ERRORS + 1))
fi
echo ""

echo "========================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. cd websocket && npm install    # If not installed"
  echo "  2. cd websocket && npm run dev    # Start WebSocket server"
  echo "  3. See WEBSOCKET_QUICKSTART.md for usage"
else
  echo -e "${RED}❌ $ERRORS error(s) found${NC}"
  echo ""
  echo "Please fix the errors above before proceeding."
  exit 1
fi
echo ""
