#!/bin/bash

# Reset Ponder sync state
# Run this when Anvil restarts to clear cached blockchain state

echo "🔄 Resetting Ponder sync state..."

# Clear Ponder schemas from database
docker exec supabase_db_eth_minority_rule psql -U postgres -d postgres -c "
  DROP SCHEMA IF EXISTS ponder CASCADE;
  DROP SCHEMA IF EXISTS ponder_sync CASCADE;
  DROP SCHEMA IF EXISTS ponder_cache CASCADE;
" 2>/dev/null

echo "✅ Ponder sync state cleared!"
echo "You can now run 'npm run dev' to start fresh"
