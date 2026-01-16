-- MinorityRuleGame Database Schema
-- Migration: 001_create_game_tables.sql

-- ============ TABLES ============

-- games table
CREATE TABLE games (
  game_id BIGINT PRIMARY KEY,
  question_text TEXT NOT NULL,
  entry_fee NUMERIC(78, 0) NOT NULL, -- wei amount
  creator_address TEXT NOT NULL,
  state TEXT NOT NULL, -- ZeroPhase, CommitPhase, RevealPhase, Completed
  current_round SMALLINT NOT NULL,
  total_players INTEGER NOT NULL,
  prize_pool NUMERIC(78, 0) NOT NULL,
  commit_deadline BIGINT,
  reveal_deadline BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL
);

-- players table (tracks all players in a game)
CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(game_id),
  player_address TEXT NOT NULL,
  joined_amount NUMERIC(78, 0) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  UNIQUE(game_id, player_address)
);

-- votes table (tracks all vote reveals across all rounds)
CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(game_id),
  round SMALLINT NOT NULL,
  player_address TEXT NOT NULL,
  vote BOOLEAN NOT NULL, -- true = yes, false = no
  revealed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  UNIQUE(game_id, round, player_address)
);

-- commits table (tracks commit phase)
CREATE TABLE commits (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(game_id),
  round SMALLINT NOT NULL,
  player_address TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  committed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  UNIQUE(game_id, round, player_address)
);

-- rounds table (tracks round results)
CREATE TABLE rounds (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(game_id),
  round SMALLINT NOT NULL,
  yes_count INTEGER NOT NULL,
  no_count INTEGER NOT NULL,
  minority_vote BOOLEAN NOT NULL,
  remaining_players INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  UNIQUE(game_id, round)
);

-- winners table
CREATE TABLE winners (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(game_id),
  player_address TEXT NOT NULL,
  prize_amount NUMERIC(78, 0) NOT NULL,
  platform_fee NUMERIC(78, 0) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  UNIQUE(game_id, player_address)
);

-- indexer_state table (tracks last indexed block)
CREATE TABLE indexer_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_indexed_block BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- ============ INDEXES ============

CREATE INDEX idx_games_state ON games(state);
CREATE INDEX idx_games_creator ON games(creator_address);
CREATE INDEX idx_players_address ON players(player_address);
CREATE INDEX idx_votes_game_round ON votes(game_id, round);
CREATE INDEX idx_votes_player ON votes(player_address);
CREATE INDEX idx_commits_game_round ON commits(game_id, round);
CREATE INDEX idx_rounds_game ON rounds(game_id);
CREATE INDEX idx_winners_player ON winners(player_address);

-- ============ ROW LEVEL SECURITY (RLS) ============

-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE indexer_state ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (for frontend queries)
CREATE POLICY "Public read access for games" ON games FOR SELECT USING (true);
CREATE POLICY "Public read access for players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access for votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read access for commits" ON commits FOR SELECT USING (true);
CREATE POLICY "Public read access for rounds" ON rounds FOR SELECT USING (true);
CREATE POLICY "Public read access for winners" ON winners FOR SELECT USING (true);
CREATE POLICY "Public read access for indexer_state" ON indexer_state FOR SELECT USING (true);

-- Service role can write (indexer uses service role key)
-- Note: Service role bypasses RLS by default, but we define policies for clarity

CREATE POLICY "Service role can insert games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update games" ON games FOR UPDATE USING (true);
CREATE POLICY "Service role can insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert commits" ON commits FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert rounds" ON rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert winners" ON winners FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update indexer_state" ON indexer_state FOR UPDATE USING (true);

-- Insert initial row for indexer_state
INSERT INTO indexer_state (id, last_indexed_block) VALUES (1, 0);
