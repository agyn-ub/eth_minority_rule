import type { Pool } from 'pg';
import { logger } from '../../utils/logger.js';
import type { Broadcaster } from '../../websocket/broadcaster.js';
import type { RoomManager } from '../../websocket/rooms.js';

export async function handleCommitPhaseStarted(
  log: any,
  db: Pool,
  roomManager: RoomManager,
  broadcaster: Broadcaster
) {
  const { gameId, round, deadline } = log.args;
  const timestamp = new Date().toISOString();

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Check if game exists
    const gameCheck = await client.query('SELECT game_id FROM games WHERE game_id = $1', [
      gameId.toString(),
    ]);

    if (gameCheck.rows.length === 0) {
      logger.warn(
        { gameId: gameId.toString() },
        'Skipping CommitPhaseStarted - game not found in database'
      );
      await client.query('ROLLBACK');
      return;
    }

    await client.query(
      `UPDATE games
       SET state = $1,
           current_round = $2,
           commit_deadline = $3,
           updated_at = $4
       WHERE game_id = $5`,
      ['CommitPhase', round, deadline.toString(), timestamp, gameId.toString()]
    );

    await client.query('COMMIT');

    // Broadcast to game channel
    const gameChannel = `game:${gameId}`;

    const message = {
      type: 'event' as const,
      channel: gameChannel,
      event: 'CommitPhaseStarted',
      data: {
        gameId: gameId.toString(),
        round,
        deadline: deadline.toString(),
      },
      timestamp: Date.now(),
    };

    broadcaster.broadcast(roomManager.getSubscribers(gameChannel), message);

    logger.info(
      { gameId: gameId.toString(), round, deadline: deadline.toString() },
      'CommitPhaseStarted event processed'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, gameId: gameId.toString() }, 'Failed to handle CommitPhaseStarted');
    throw error;
  } finally {
    client.release();
  }
}
