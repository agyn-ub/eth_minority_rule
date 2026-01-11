import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Game: p.createTable({
    id: p.bigint(),
    questionText: p.string(),
    entryFee: p.string(), // Store as string to handle big numbers
    creatorAddress: p.string(),
    state: p.string(), // ZeroPhase, CommitPhase, RevealPhase, Completed
    currentRound: p.int(),
    totalPlayers: p.int(),
    prizePool: p.string(),
    commitDeadline: p.bigint().optional(),
    revealDeadline: p.bigint().optional(),
    blockNumber: p.bigint(),
    transactionHash: p.string(),
  }),

  Player: p.createTable({
    id: p.string(), // Composite key: gameId-playerAddress
    gameId: p.bigint().references("Game.id"),
    playerAddress: p.string(),
    joinedAmount: p.string(),
    blockNumber: p.bigint(),
    transactionHash: p.string(),
  }),

  Vote: p.createTable({
    id: p.string(), // Composite key: gameId-round-playerAddress
    gameId: p.bigint().references("Game.id"),
    round: p.int(),
    playerAddress: p.string(),
    vote: p.boolean(),
    blockNumber: p.bigint(),
    transactionHash: p.string(),
  }),

  Commit: p.createTable({
    id: p.string(), // Composite key: gameId-round-playerAddress
    gameId: p.bigint().references("Game.id"),
    round: p.int(),
    playerAddress: p.string(),
    commitHash: p.string(),
    blockNumber: p.bigint(),
    transactionHash: p.string(),
  }),

  Round: p.createTable({
    id: p.string(), // Composite key: gameId-round
    gameId: p.bigint().references("Game.id"),
    round: p.int(),
    yesCount: p.int(),
    noCount: p.int(),
    minorityVote: p.boolean(),
    remainingPlayers: p.int(),
    blockNumber: p.bigint(),
    transactionHash: p.string(),
  }),

  Winner: p.createTable({
    id: p.string(), // Composite key: gameId-playerAddress
    gameId: p.bigint().references("Game.id"),
    playerAddress: p.string(),
    prizeAmount: p.string(),
    platformFee: p.string(),
    blockNumber: p.bigint(),
    transactionHash: p.string(),
  }),
}));
