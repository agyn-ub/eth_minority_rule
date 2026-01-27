-- games table
CREATE TABLE games (
  game_id BIGINT PRIMARY KEY,
  question_text TEXT NOT NULL,
  entry_fee TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  state TEXT NOT NULL,
  current_round INTEGER NOT NULL,
  total_players INTEGER NOT NULL,
  prize_pool TEXT NOT NULL,
  commit_deadline BIGINT,
  reveal_deadline BIGINT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL
);

-- players table
CREATE TABLE players (
  game_id BIGINT NOT NULL,
  player_address TEXT NOT NULL,
  joined_amount TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  PRIMARY KEY (game_id, player_address)
);

-- votes table
CREATE TABLE votes (
  game_id BIGINT NOT NULL,
  round INTEGER NOT NULL,
  player_address TEXT NOT NULL,
  vote BOOLEAN NOT NULL,
  revealed_at TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  PRIMARY KEY (game_id, round, player_address)
);

-- commits table
CREATE TABLE commits (
  game_id BIGINT NOT NULL,
  round INTEGER NOT NULL,
  player_address TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  committed_at TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  PRIMARY KEY (game_id, round, player_address)
);

-- rounds table
CREATE TABLE rounds (
  game_id BIGINT NOT NULL,
  round INTEGER NOT NULL,
  yes_count INTEGER NOT NULL,
  no_count INTEGER NOT NULL,
  minority_vote BOOLEAN NOT NULL,
  remaining_players INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  PRIMARY KEY (game_id, round)
);

-- winners table
CREATE TABLE winners (
  game_id BIGINT NOT NULL,
  player_address TEXT NOT NULL,
  prize_amount TEXT NOT NULL,
  platform_fee TEXT NOT NULL,
  paid_at TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  PRIMARY KEY (game_id, player_address)
);

-- eliminations table
CREATE TABLE eliminations (
  game_id BIGINT NOT NULL,
  player_address TEXT NOT NULL,
  eliminated BOOLEAN NOT NULL,
  eliminated_round INTEGER,
  PRIMARY KEY (game_id, player_address)
);

-- Indexes
CREATE INDEX idx_games_state ON games(state);
CREATE INDEX idx_games_creator ON games(creator_address);
CREATE INDEX idx_players_game ON players(game_id);
CREATE INDEX idx_players_address ON players(player_address);
CREATE INDEX idx_votes_game_round ON votes(game_id, round);
CREATE INDEX idx_commits_game_round ON commits(game_id, round);
CREATE INDEX idx_eliminations_game ON eliminations(game_id);

-- RLS Policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE eliminations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON games FOR SELECT USING (true);
CREATE POLICY "Public read" ON players FOR SELECT USING (true);
CREATE POLICY "Public read" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read" ON commits FOR SELECT USING (true);
CREATE POLICY "Public read" ON rounds FOR SELECT USING (true);
CREATE POLICY "Public read" ON winners FOR SELECT USING (true);
CREATE POLICY "Public read" ON eliminations FOR SELECT USING (true);

CREATE POLICY "Service write" ON games FOR ALL USING (true);
CREATE POLICY "Service write" ON players FOR ALL USING (true);
CREATE POLICY "Service write" ON votes FOR ALL USING (true);
CREATE POLICY "Service write" ON commits FOR ALL USING (true);
CREATE POLICY "Service write" ON rounds FOR ALL USING (true);
CREATE POLICY "Service write" ON winners FOR ALL USING (true);
CREATE POLICY "Service write" ON eliminations FOR ALL USING (true);
