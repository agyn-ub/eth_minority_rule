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

### Tables
- **games** - Main game state and metadata
- **players** - Player participation records
- **votes** - Vote reveals (round history)
- **commits** - Vote commitments (hashed votes)
- **rounds** - Round results and statistics
- **winners** - Prize distribution records
- **indexer_state** - Tracks indexer sync progress

### Row Level Security (RLS)
- **Public Read**: All tables allow public SELECT queries (for frontend)
- **Service Write**: Indexer uses service role key for INSERT/UPDATE

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

# Generate TypeScript types (for frontend)
supabase gen types typescript --local > ../frontend/src/types/database.ts
```

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
