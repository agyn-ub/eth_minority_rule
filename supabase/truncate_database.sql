-- Truncate Database Script
-- WARNING: This will delete ALL data from all tables

-- Truncate all tables (CASCADE handles foreign key constraints)
TRUNCATE TABLE winners CASCADE;
TRUNCATE TABLE rounds CASCADE;
TRUNCATE TABLE commits CASCADE;
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE games CASCADE;

-- Reset indexer state to block 0
UPDATE indexer_state SET last_indexed_block = 0, updated_at = NOW() WHERE id = 1;

-- Success message
SELECT 'Database truncated successfully. All data cleared.' AS result;
