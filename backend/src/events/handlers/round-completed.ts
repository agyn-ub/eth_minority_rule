import type { Pool } from 'pg';
import { logger } from '../../utils/logger.js';
import type { Broadcaster } from '../../websocket/broadcaster.js';
import type { RoomManager } from '../../websocket/rooms.js';

export async function handleRoundCompleted(
  log: any,
  db: Pool,
  roomManager: RoomManager,
  broadcaster: Broadcaster
) {
  const { gameId, round, yesCount, noCount, minorityVote, votesRemaining } = log.args;
  const timestamp = new Date().toISOString();

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Insert round result
    await client.query(
      `INSERT INTO rounds (game_id, round, yes_count, no_count, minority_vote, remaining_players, completed_at, block_number, transaction_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (game_id, round) DO NOTHING`,
      [
        gameId.toString(),
        round,
        yesCount,
        noCount,
        minorityVote,
        votesRemaining,
        timestamp,
        log.blockNumber.toString(),
        log.transactionHash,
      ]
    );

    const minorityText = minorityVote ? 'YES' : 'NO';
    logger.info(
      {
        gameId: gameId.toString(),
        round,
        minority: minorityText,
        remaining: votesRemaining,
      },
      'Round completed - processing eliminations'
    );

    // Fetch all votes for this round to determine who was eliminated
    const votesResult = await client.query(
      `SELECT player_address, vote
       FROM votes
       WHERE game_id = $1 AND round = $2`,
      [gameId.toString(), round]
    );

    // Determine who got eliminated (players who voted with MAJORITY)
    // In Minority Rule: minorities survive, majorities are eliminated
    const eliminatedPlayers = votesResult.rows
      .filter((vote) => vote.vote !== minorityVote)
      .map((vote) => vote.player_address);

    // Update eliminations for each eliminated player
    if (eliminatedPlayers.length > 0) {
      for (const playerAddress of eliminatedPlayers) {
        await client.query(
          `UPDATE eliminations
           SET eliminated = $1, eliminated_round = $2
           WHERE game_id = $3 AND player_address = $4`,
          [true, round, gameId.toString(), playerAddress]
        );
      }

      logger.info(
        { gameId: gameId.toString(), round, count: eliminatedPlayers.length },
        'Players marked as eliminated'
      );
    }

    // Check if game exists
    const gameCheck = await client.query('SELECT game_id FROM games WHERE game_id = $1', [
      gameId.toString(),
    ]);

    if (gameCheck.rows.length === 0) {
      logger.warn(
        { gameId: gameId.toString() },
        'Skipping game update in RoundCompleted - game not found'
      );
      await client.query('ROLLBACK');
      return;
    }

    // Update game state: reset to ZeroPhase, clear deadlines, increment round
    await client.query(
      `UPDATE games
       SET state = $1,
           commit_deadline = NULL,
           reveal_deadline = NULL,
           current_round = $2,
           updated_at = $3
       WHERE game_id = $4`,
      ['ZeroPhase', round + 1, timestamp, gameId.toString()]
    );

    await client.query('COMMIT');

    // Broadcast to game channel
    const gameChannel = `game:${gameId}`;

    const message = {
      type: 'event' as const,
      channel: gameChannel,
      event: 'RoundCompleted',
      data: {
        gameId: gameId.toString(),
        round,
        yesCount,
        noCount,
        minorityVote,
        minorityText,
        votesRemaining,
        eliminatedPlayers,
      },
      timestamp: Date.now(),
    };

    broadcaster.broadcast(roomManager.getSubscribers(gameChannel), message);

    logger.info(
      { gameId: gameId.toString(), round, nextRound: round + 1 },
      'RoundCompleted event processed'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, gameId: gameId.toString() }, 'Failed to handle RoundCompleted');
    throw error;
  } finally {
    client.release();
  }
}
