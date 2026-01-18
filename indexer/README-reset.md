# Ponder Database Reset

This directory contains scripts to reset your Ponder database and start fresh.

## Files

- `reset-database.sql` - SQL script to drop all Ponder tables
- `reset-database.sh` - Shell script that runs the SQL and provides guidance
- `README-reset.md` - This file

## Method 1: Using the Shell Script (Recommended)

```bash
cd /Users/angus/Desktop/projects/Base/eth_minority_rule/indexer
./reset-database.sh
```

This will:
1. Read your DATABASE_URL from `.env.local`
2. Confirm before proceeding
3. Drop all Ponder tables
4. Show you next steps

## Method 2: Using SQL Directly

### Option A: Command Line
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres -f reset-database.sql
```

### Option B: Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `reset-database.sql`
4. Click "Run"

## Method 3: Manual SQL (Supabase Dashboard)

If the scripts don't work, run this in Supabase SQL Editor:

```sql
-- Drop all versioned tables
DROP TABLE IF EXISTS "5742__commits", "5742__games", "5742__players", "5742__rounds", "5742__votes", "5742__winners" CASCADE;
DROP TABLE IF EXISTS "5742_reorg__commits", "5742_reorg__games", "5742_reorg__players", "5742_reorg__rounds", "5742_reorg__votes", "5742_reorg__winners" CASCADE;
DROP TABLE IF EXISTS "b2ad__commits", "b2ad__games", "b2ad__players", "b2ad__rounds", "b2ad__votes", "b2ad__winners" CASCADE;
DROP TABLE IF EXISTS "b2ad_reorg__commits", "b2ad_reorg__games", "b2ad_reorg__players", "b2ad_reorg__rounds", "b2ad_reorg__votes", "b2ad_reorg__winners" CASCADE;

-- Drop views
DROP VIEW IF EXISTS commits, games, players, rounds, votes, winners CASCADE;

-- Drop Ponder metadata
DROP TABLE IF EXISTS _ponder_meta CASCADE;
DROP SCHEMA IF EXISTS ponder_sync CASCADE;
```

## After Reset

1. Start Ponder:
   ```bash
   npm run dev
   ```

2. Ponder will:
   - Create new versioned tables (with new hash prefix)
   - Create views pointing to them
   - Re-index all events from your configured start block

## Troubleshooting

### If you see new hash prefixes
This is normal! Ponder generates a new hash for each schema version. The views (`commits`, `games`, etc.) will point to the new tables.

### If tables still exist
Check what's left:
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%\_\_%' OR tablename LIKE '_ponder%')
ORDER BY tablename;
```

Then manually drop any remaining tables.
