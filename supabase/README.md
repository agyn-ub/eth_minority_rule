# Supabase Setup

This directory contains the database schema for the MinorityRuleGame indexer.

## Quick Start

### Option 1: Use Supabase Cloud (Recommended for Production)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run the Migration**
   ```bash
   # Copy the SQL from migrations/001_create_game_tables.sql
   # Paste it into the Supabase SQL Editor
   # Or use the Supabase CLI:

   supabase link --project-ref your-project-ref
   supabase db push
   ```

3. **Get Connection Details**
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: For frontend (public read access)
   - Service Role Key: For indexer (write access)

### Option 2: Local Supabase (Recommended for Development)

1. **Install Supabase CLI**
   ```bash
   # macOS
   brew install supabase/tap/supabase

   # Or using npm
   npm install -g supabase
   ```

2. **Start Local Supabase**
   ```bash
   cd /path/to/eth_minority_rule

   # Initialize (first time only)
   supabase init

   # Start local Supabase stack (Postgres, Studio, Auth, etc.)
   supabase start
   ```

3. **Apply Migrations**
   ```bash
   # The migration files in supabase/migrations/ will be auto-applied
   # Or manually reset the database:
   supabase db reset
   ```

4. **Access Local Supabase**
   - API URL: `http://localhost:54321`
   - Studio URL: `http://localhost:54323` (Database UI)
   - Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`
   - Anon Key: (shown in terminal output)
   - Service Role Key: (shown in terminal output)

## Environment Variables

### For Indexer (Ponder)
```bash
# .env.local (Anvil local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# .env (Base Sepolia / Production)
DATABASE_URL=postgresql://postgres.[your-project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### For Frontend (Next.js)
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # or https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Database Schema

### Blockchain Tables (Created by Ponder Indexer)
- **games** - Main game state and metadata
- **players** - Player participation records
- **votes** - Vote reveals (round history)
- **commits** - Vote commitments (hashed votes)
- **rounds** - Round results and statistics
- **winners** - Prize distribution records

**Note:** Ponder automatically creates and manages these tables. Do NOT create them via migrations.

### User Tables (Created by Supabase Migrations)
- **user_profiles** - User display names linked to wallet addresses

### Linking
All tables are linked via `wallet_address` / `player_address` / `creator_address`.

### Row Level Security (RLS)
- **Blockchain tables**: Managed by Ponder
- **User tables**: Public read, service write

## Useful Commands

```bash
# View local database in browser
supabase start
open http://localhost:54323

# Connect to local Postgres
psql postgresql://postgres:postgres@localhost:54322/postgres

# View logs
supabase logs

# Stop local Supabase
supabase stop

# Reset database (re-run migrations)
supabase db reset

# Truncate all data (keep schema, clear data only)
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/truncate_database.sql

# Generate TypeScript types (for frontend)
supabase gen types typescript --local > ../frontend/src/types/database.ts
```

## Clear Database Data

### Option 1: Truncate Blockchain Data (Ponder Tables)
```bash
# Clear blockchain tables (Ponder will recreate on restart)
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/truncate_database.sql
```
**Use this when:** You want to reindex blockchain data from scratch.

### Option 2: Reset Everything
```bash
# Drop all tables (user + blockchain)
supabase db reset

# Reapply user table migrations
supabase db push

# Restart indexer (recreates blockchain tables)
cd ../indexer && npm run dev
```
**Use this when:** You want a completely fresh start.

## Verification

After running migrations, verify the schema:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- View initial indexer state
SELECT * FROM indexer_state;
```

## Troubleshooting

### Migration Failed
```bash
# Reset and try again
supabase db reset
```

### Can't Connect to Database
```bash
# Check if Supabase is running
supabase status

# Restart
supabase stop
supabase start
```

### Permission Errors
- Frontend should use **ANON KEY** (public read-only)
- Indexer should use **SERVICE ROLE KEY** (full access)
