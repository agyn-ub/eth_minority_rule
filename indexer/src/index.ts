import { ponder } from "@/generated";
import * as schema from "../ponder.schema";

// ============ GameCreated Event ============
ponder.on("MinorityRuleGame:GameCreated", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  await context.db.insert(schema.games).values({
    game_id: event.args.gameId,
    question_text: event.args.questionText,
    entry_fee: event.args.entryFee.toString(),
    creator_address: event.args.creator.toLowerCase(),
    state: "ZeroPhase",
    current_round: 1,
    total_players: 0,
    prize_pool: "0",
    commit_deadline: undefined,
    reveal_deadline: undefined,
    created_at: timestamp,
    updated_at: timestamp,
    block_number: event.block.number,
    transaction_hash: event.transaction.hash,
  });

  console.log(`✅ Game ${event.args.gameId} created by ${event.args.creator}`);
});

// ============ PlayerJoined Event ============
ponder.on("MinorityRuleGame:PlayerJoined", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  // Check if game exists
  const existingGame = await context.db.find(schema.games, { game_id: event.args.gameId });

  if (!existingGame) {
    console.warn(
      `⚠️  Skipping PlayerJoined for game ${event.args.gameId} - game not found in database`
    );
    return;
  }

  // Insert player record
  await context.db.insert(schema.players).values({
    game_id: event.args.gameId,
    player_address: event.args.player.toLowerCase(),
    joined_amount: event.args.amount.toString(),
    joined_at: timestamp,
    block_number: event.block.number,
    transaction_hash: event.transaction.hash,
  });

  // Update game
  await context.db.update(schema.games, { game_id: event.args.gameId }).set((row) => ({
    total_players: event.args.totalPlayers,
    prize_pool: (BigInt(row.prize_pool) + event.args.amount).toString(),
    updated_at: timestamp,
  }));

  console.log(`✅ Player ${event.args.player} joined game ${event.args.gameId}`);
});

// ============ VoteCommitted Event ============
ponder.on("MinorityRuleGame:VoteCommitted", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  await context.db.insert(schema.commits).values({
    game_id: event.args.gameId,
    round: event.args.round,
    player_address: event.args.player.toLowerCase(),
    commit_hash: event.args.commitHash,
    committed_at: timestamp,
    block_number: event.block.number,
    transaction_hash: event.transaction.hash,
  });

  console.log(
    `✅ Vote committed by ${event.args.player} for game ${event.args.gameId} round ${event.args.round}`
  );
});

// ============ VoteRevealed Event ============
ponder.on("MinorityRuleGame:VoteRevealed", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  await context.db.insert(schema.votes).values({
    game_id: event.args.gameId,
    round: event.args.round,
    player_address: event.args.player.toLowerCase(),
    vote: event.args.vote,
    revealed_at: timestamp,
    block_number: event.block.number,
    transaction_hash: event.transaction.hash,
  });

  const voteText = event.args.vote ? "YES" : "NO";
  console.log(
    `✅ Vote revealed by ${event.args.player}: ${voteText} (game ${event.args.gameId} round ${event.args.round})`
  );
});

// ============ CommitPhaseStarted Event ============
ponder.on("MinorityRuleGame:CommitPhaseStarted", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  // Check if game exists
  const existingGame = await context.db.find(schema.games, { game_id: event.args.gameId });

  if (!existingGame) {
    console.warn(
      `⚠️  Skipping CommitPhaseStarted for game ${event.args.gameId} - game not found in database`
    );
    return;
  }

  await context.db.update(schema.games, { game_id: event.args.gameId }).set({
    state: "CommitPhase",
    current_round: event.args.round,
    commit_deadline: event.args.deadline,
    updated_at: timestamp,
  });

  console.log(
    `✅ Commit phase started for game ${event.args.gameId} round ${event.args.round} (deadline: ${event.args.deadline})`
  );
});

// ============ RevealPhaseStarted Event ============
ponder.on("MinorityRuleGame:RevealPhaseStarted", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  // Check if game exists
  const existingGame = await context.db.find(schema.games, { game_id: event.args.gameId });

  if (!existingGame) {
    console.warn(
      `⚠️  Skipping RevealPhaseStarted for game ${event.args.gameId} - game not found in database`
    );
    return;
  }

  await context.db.update(schema.games, { game_id: event.args.gameId }).set({
    state: "RevealPhase",
    reveal_deadline: event.args.deadline,
    updated_at: timestamp,
  });

  console.log(
    `✅ Reveal phase started for game ${event.args.gameId} round ${event.args.round} (deadline: ${event.args.deadline})`
  );
});

// ============ RoundCompleted Event ============
ponder.on("MinorityRuleGame:RoundCompleted", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  // Insert round result
  await context.db.insert(schema.rounds).values({
    game_id: event.args.gameId,
    round: event.args.round,
    yes_count: event.args.yesCount,
    no_count: event.args.noCount,
    minority_vote: event.args.minorityVote,
    remaining_players: event.args.votesRemaining,
    completed_at: timestamp,
    block_number: event.block.number,
    transaction_hash: event.transaction.hash,
  });

  const minorityText = event.args.minorityVote ? "YES" : "NO";
  console.log(
    `✅ Round ${event.args.round} completed for game ${event.args.gameId} | Minority: ${minorityText} | Remaining: ${event.args.votesRemaining}`
  );
});

// ============ GameCompleted Event ============
ponder.on("MinorityRuleGame:GameCompleted", async ({ event, context }) => {
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();

  // Check if game exists before updating
  const existingGame = await context.db.find(schema.games, { game_id: event.args.gameId });

  if (!existingGame) {
    console.warn(
      `⚠️  Skipping GameCompleted for game ${event.args.gameId} - game not found in database (likely db/blockchain out of sync)`
    );
    return;
  }

  // Update game state
  await context.db.update(schema.games, { game_id: event.args.gameId }).set({
    state: "Completed",
    updated_at: timestamp,
  });

  // Insert winners
  for (const winner of event.args.winners) {
    await context.db.insert(schema.winners).values({
      game_id: event.args.gameId,
      player_address: winner.toLowerCase(),
      prize_amount: event.args.prizePerWinner.toString(),
      platform_fee: event.args.platformFee.toString(),
      paid_at: timestamp,
      block_number: event.block.number,
      transaction_hash: event.transaction.hash,
    });
  }

  console.log(
    `🎉 Game ${event.args.gameId} completed! ${event.args.winners.length} winner(s) | Prize per winner: ${event.args.prizePerWinner}`
  );
});
