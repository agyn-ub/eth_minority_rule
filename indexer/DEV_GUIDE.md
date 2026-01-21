# Development Guide

## Starting After MacBook Restart

When you restart your MacBook, Anvil loses its blockchain state (it starts fresh at block 0), but Ponder's database retains sync state from the previous session. This causes a mismatch.

### Quick Solution

Use the fresh start command:

```bash
npm run dev:fresh
```

This will:
1. Clear Ponder's sync state
2. Start Ponder fresh

### Manual Steps

If you prefer to do it manually:

```bash
# 1. Clear Ponder sync state
npm run reset

# 2. Start Ponder
npm run dev
```

## Common Workflows

### Option 1: Quick Development (Recommended after restart)
```bash
npm run dev:fresh
```
- Clears old sync state
- Starts fresh with current Anvil state

### Option 2: Normal Development (When already running)
```bash
npm run dev
```
- Use when continuing work without restarting Anvil

### Option 3: Just Reset (Don't start)
```bash
npm run reset
```
- Useful if you just want to clear state

## Troubleshooting

### Error: "Block at number X could not be found"

This means Ponder's database has cached state from a previous Anvil session.

**Solution:**
```bash
npm run dev:fresh
```

### Anvil Not Running

Make sure Anvil is running before starting Ponder:
```bash
# Check if Anvil is running
ps aux | grep anvil

# Start Anvil if needed (from solidity directory)
anvil
```

### Database Not Running

Make sure Supabase is running:
```bash
# Check if Supabase containers are running
docker ps | grep supabase

# Start Supabase if needed (from project root)
supabase start
```

## Development Stack Startup Order

1. **Supabase** (Database)
   ```bash
   supabase start
   ```

2. **Anvil** (Local Blockchain)
   ```bash
   anvil
   ```

3. **Ponder** (Indexer)
   ```bash
   npm run dev:fresh  # After restart
   # OR
   npm run dev        # When continuing
   ```

## Alternative: Persistent Anvil (Advanced)

If you want Anvil to persist state across restarts, you can use:

```bash
anvil --state-interval 1 --dump-state ./anvil-state.json --load-state ./anvil-state.json
```

This saves Anvil state to disk, but you'll need to manage the state file.
