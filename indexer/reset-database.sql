-- ============================================
-- Ponder Database Reset Script
-- ============================================
-- This script drops all Ponder tables and metadata
-- to start indexing from scratch.
--
-- Usage:
--   psql postgresql://postgres:postgres@localhost:54322/postgres -f reset-database.sql
--
-- Or from Supabase SQL Editor:
--   Copy and paste this entire file
-- ============================================

-- Drop all versioned tables (Ponder creates these with hash prefixes)
-- Pattern: {hash}__tablename and {hash}_reorg__tablename

-- 5742 prefix tables
DROP TABLE IF EXISTS "5742__commits" CASCADE;
DROP TABLE IF EXISTS "5742__games" CASCADE;
DROP TABLE IF EXISTS "5742__players" CASCADE;
DROP TABLE IF EXISTS "5742__rounds" CASCADE;
DROP TABLE IF EXISTS "5742__votes" CASCADE;
DROP TABLE IF EXISTS "5742__winners" CASCADE;

-- 5742_reorg prefix tables
DROP TABLE IF EXISTS "5742_reorg__commits" CASCADE;
DROP TABLE IF EXISTS "5742_reorg__games" CASCADE;
DROP TABLE IF EXISTS "5742_reorg__players" CASCADE;
DROP TABLE IF EXISTS "5742_reorg__rounds" CASCADE;
DROP TABLE IF EXISTS "5742_reorg__votes" CASCADE;
DROP TABLE IF EXISTS "5742_reorg__winners" CASCADE;

-- b2ad prefix tables
DROP TABLE IF EXISTS "b2ad__commits" CASCADE;
DROP TABLE IF EXISTS "b2ad__games" CASCADE;
DROP TABLE IF EXISTS "b2ad__players" CASCADE;
DROP TABLE IF EXISTS "b2ad__rounds" CASCADE;
DROP TABLE IF EXISTS "b2ad__votes" CASCADE;
DROP TABLE IF EXISTS "b2ad__winners" CASCADE;

-- b2ad_reorg prefix tables
DROP TABLE IF EXISTS "b2ad_reorg__commits" CASCADE;
DROP TABLE IF EXISTS "b2ad_reorg__games" CASCADE;
DROP TABLE IF EXISTS "b2ad_reorg__players" CASCADE;
DROP TABLE IF EXISTS "b2ad_reorg__rounds" CASCADE;
DROP TABLE IF EXISTS "b2ad_reorg__votes" CASCADE;
DROP TABLE IF EXISTS "b2ad_reorg__winners" CASCADE;

-- Drop views (Ponder creates these as references to the versioned tables)
DROP VIEW IF EXISTS commits CASCADE;
DROP VIEW IF EXISTS games CASCADE;
DROP VIEW IF EXISTS players CASCADE;
DROP VIEW IF EXISTS rounds CASCADE;
DROP VIEW IF EXISTS votes CASCADE;
DROP VIEW IF EXISTS winners CASCADE;

-- Drop Ponder metadata table
DROP TABLE IF EXISTS _ponder_meta CASCADE;

-- Drop Ponder sync schema (RPC cache)
DROP SCHEMA IF EXISTS ponder_sync CASCADE;

-- Optional: Drop user_profiles if you want to reset that too
-- Uncomment the line below if needed:
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to see remaining Ponder tables
-- SELECT tablename FROM pg_tables
-- WHERE schemaname = 'public'
-- AND (tablename LIKE '%\_\_%' OR tablename LIKE '_ponder%')
-- ORDER BY tablename;
