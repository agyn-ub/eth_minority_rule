import { ponder } from "@/generated";

// ============ GameCreated Event ============
ponder.on("MinorityRuleGame:GameCreated", async ({ event, context }) => {
  await context.db.Game.create({
    id: event.args.gameId,
    data: {
      questionText: event.args.questionText,
      entryFee: event.args.entryFee.toString(),
      creatorAddress: event.args.creator.toLowerCase(),
      state: "ZeroPhase", // Initial state
      currentRound: 1,
      totalPlayers: 0,
      prizePool: "0",
      commitDeadline: undefined,
      revealDeadline: undefined,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    },
  });

  console.log(`✅ Game ${event.args.gameId} created by ${event.args.creator}`);
});

// ============ PlayerJoined Event ============
ponder.on("MinorityRuleGame:PlayerJoined", async ({ event, context }) => {
  const playerId = `${event.args.gameId}-${event.args.player.toLowerCase()}`;

  // Insert player record
  await context.db.Player.create({
    id: playerId,
    data: {
      gameId: event.args.gameId,
      playerAddress: event.args.player.toLowerCase(),
      joinedAmount: event.args.amount.toString(),
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    },
  });

  // Update game
  await context.db.Game.update({
    id: event.args.gameId,
    data: ({ current }) => ({
      totalPlayers: event.args.totalPlayers,
      prizePool: (BigInt(current.prizePool) + event.args.amount).toString(),
    }),
  });

  console.log(`✅ Player ${event.args.player} joined game ${event.args.gameId}`);
});

// ============ VoteCommitted Event ============
ponder.on("MinorityRuleGame:VoteCommitted", async ({ event, context }) => {
  const commitId = `${event.args.gameId}-${event.args.round}-${event.args.player.toLowerCase()}`;

  await context.db.Commit.create({
    id: commitId,
    data: {
      gameId: event.args.gameId,
      round: event.args.round,
      playerAddress: event.args.player.toLowerCase(),
      commitHash: event.args.commitHash,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    },
  });

  console.log(
    `✅ Vote committed by ${event.args.player} for game ${event.args.gameId} round ${event.args.round}`
  );
});

// ============ VoteRevealed Event ============
ponder.on("MinorityRuleGame:VoteRevealed", async ({ event, context }) => {
  const voteId = `${event.args.gameId}-${event.args.round}-${event.args.player.toLowerCase()}`;

  await context.db.Vote.create({
    id: voteId,
    data: {
      gameId: event.args.gameId,
      round: event.args.round,
      playerAddress: event.args.player.toLowerCase(),
      vote: event.args.vote,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    },
  });

  const voteText = event.args.vote ? "YES" : "NO";
  console.log(
    `✅ Vote revealed by ${event.args.player}: ${voteText} (game ${event.args.gameId} round ${event.args.round})`
  );
});

// ============ CommitPhaseStarted Event ============
ponder.on("MinorityRuleGame:CommitPhaseStarted", async ({ event, context }) => {
  await context.db.Game.update({
    id: event.args.gameId,
    data: {
      state: "CommitPhase",
      currentRound: event.args.round,
      commitDeadline: event.args.deadline,
    },
  });

  console.log(
    `✅ Commit phase started for game ${event.args.gameId} round ${event.args.round} (deadline: ${event.args.deadline})`
  );
});

// ============ RevealPhaseStarted Event ============
ponder.on("MinorityRuleGame:RevealPhaseStarted", async ({ event, context }) => {
  await context.db.Game.update({
    id: event.args.gameId,
    data: {
      state: "RevealPhase",
      revealDeadline: event.args.deadline,
    },
  });

  console.log(
    `✅ Reveal phase started for game ${event.args.gameId} round ${event.args.round} (deadline: ${event.args.deadline})`
  );
});

// ============ RoundCompleted Event ============
ponder.on("MinorityRuleGame:RoundCompleted", async ({ event, context }) => {
  const roundId = `${event.args.gameId}-${event.args.round}`;

  // Insert round result
  await context.db.Round.create({
    id: roundId,
    data: {
      gameId: event.args.gameId,
      round: event.args.round,
      yesCount: event.args.yesCount,
      noCount: event.args.noCount,
      minorityVote: event.args.minorityVote,
      remainingPlayers: event.args.votesRemaining,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    },
  });

  const minorityText = event.args.minorityVote ? "YES" : "NO";
  console.log(
    `✅ Round ${event.args.round} completed for game ${event.args.gameId} | Minority: ${minorityText} | Remaining: ${event.args.votesRemaining}`
  );
});

// ============ GameCompleted Event ============
ponder.on("MinorityRuleGame:GameCompleted", async ({ event, context }) => {
  // Update game state
  await context.db.Game.update({
    id: event.args.gameId,
    data: {
      state: "Completed",
    },
  });

  // Insert winners
  for (const winner of event.args.winners) {
    const winnerId = `${event.args.gameId}-${winner.toLowerCase()}`;

    await context.db.Winner.create({
      id: winnerId,
      data: {
        gameId: event.args.gameId,
        playerAddress: winner.toLowerCase(),
        prizeAmount: event.args.prizePerWinner.toString(),
        platformFee: event.args.platformFee.toString(),
        blockNumber: event.block.number,
        transactionHash: event.transaction.hash,
      },
    });
  }

  console.log(
    `🎉 Game ${event.args.gameId} completed! ${event.args.winners.length} winner(s) | Prize per winner: ${event.args.prizePerWinner}`
  );
});
