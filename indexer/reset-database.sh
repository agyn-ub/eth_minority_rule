#!/bin/bash

# ============================================
# Ponder Database Reset Script (Shell Version)
# ============================================
# This script resets the Ponder database by:
# 1. Running the SQL drop script
# 2. Restarting Ponder to recreate tables
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Ponder Database Reset${NC}"
echo "======================================"
echo ""

# Get database URL from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep DATABASE_URL | xargs)
else
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set in .env.local${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Database:${NC} ${DATABASE_URL}"
echo ""

# Confirm before proceeding
read -p "⚠️  This will delete ALL Ponder tables and data. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🗑️  Dropping all Ponder tables...${NC}"

# Run the SQL script
psql "$DATABASE_URL" -f reset-database.sql

echo ""
echo -e "${GREEN}✅ Database reset complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Start Ponder: ${GREEN}npm run dev${NC}"
echo "  2. Ponder will recreate all tables and re-index from block 0"
echo ""
