import { onchainTable, primaryKey } from "@ponder/core";

export const games = onchainTable("games", (p) => ({
  game_id: p.bigint().primaryKey(),
  question_text: p.text().notNull(),
  entry_fee: p.text().notNull(), // NUMERIC(78,0) stored as string
  creator_address: p.text().notNull(),
  state: p.text().notNull(), // ZeroPhase, CommitPhase, RevealPhase, Completed
  current_round: p.integer().notNull(),
  total_players: p.integer().notNull(),
  prize_pool: p.text().notNull(), // NUMERIC(78,0) stored as string
  commit_deadline: p.bigint(),
  reveal_deadline: p.bigint(),
  created_at: p.text().notNull(),
  updated_at: p.text().notNull(),
  block_number: p.bigint().notNull(),
  transaction_hash: p.text().notNull(),
}));

export const players = onchainTable("players", (p) => ({
  game_id: p.bigint().notNull(),
  player_address: p.text().notNull(),
  joined_amount: p.text().notNull(), // NUMERIC(78,0) stored as string
  joined_at: p.text().notNull(),
  block_number: p.bigint().notNull(),
  transaction_hash: p.text().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.game_id, table.player_address] })
}));

export const votes = onchainTable("votes", (p) => ({
  game_id: p.bigint().notNull(),
  round: p.integer().notNull(),
  player_address: p.text().notNull(),
  vote: p.boolean().notNull(), // true = yes, false = no
  revealed_at: p.text().notNull(),
  block_number: p.bigint().notNull(),
  transaction_hash: p.text().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.game_id, table.round, table.player_address] })
}));

export const commits = onchainTable("commits", (p) => ({
  game_id: p.bigint().notNull(),
  round: p.integer().notNull(),
  player_address: p.text().notNull(),
  commit_hash: p.text().notNull(),
  committed_at: p.text().notNull(),
  block_number: p.bigint().notNull(),
  transaction_hash: p.text().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.game_id, table.round, table.player_address] })
}));

export const rounds = onchainTable("rounds", (p) => ({
  game_id: p.bigint().notNull(),
  round: p.integer().notNull(),
  yes_count: p.integer().notNull(),
  no_count: p.integer().notNull(),
  minority_vote: p.boolean().notNull(),
  remaining_players: p.integer().notNull(),
  completed_at: p.text().notNull(),
  block_number: p.bigint().notNull(),
  transaction_hash: p.text().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.game_id, table.round] })
}));

export const winners = onchainTable("winners", (p) => ({
  game_id: p.bigint().notNull(),
  player_address: p.text().notNull(),
  prize_amount: p.text().notNull(), // NUMERIC(78,0) stored as string
  platform_fee: p.text().notNull(), // NUMERIC(78,0) stored as string
  paid_at: p.text().notNull(),
  block_number: p.bigint().notNull(),
  transaction_hash: p.text().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.game_id, table.player_address] })
}));
