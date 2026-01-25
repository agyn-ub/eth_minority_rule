import type { Pool } from 'pg';
import { logger } from '../../utils/logger.js';
import type { Broadcaster } from '../../websocket/broadcaster.js';
import type { RoomManager } from '../../websocket/rooms.js';

export async function handleGameCompleted(
  log: any,
  db: Pool,
  roomManager: RoomManager,
  broadcaster: Broadcaster
) {
  const { gameId, winners, prizePerWinner, platformFee } = log.args;
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
        'Skipping GameCompleted - game not found in database'
      );
      await client.query('ROLLBACK');
      return;
    }

    // Update game state
    await client.query(
      `UPDATE games
       SET state = $1, updated_at = $2
       WHERE game_id = $3`,
      ['Completed', timestamp, gameId.toString()]
    );

    // Insert winners
    for (const winner of winners) {
      await client.query(
        `INSERT INTO winners (game_id, player_address, prize_amount, platform_fee, paid_at, block_number, transaction_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (game_id, player_address) DO NOTHING`,
        [
          gameId.toString(),
          winner.toLowerCase(),
          prizePerWinner.toString(),
          platformFee.toString(),
          timestamp,
          log.blockNumber.toString(),
          log.transactionHash,
        ]
      );
    }

    await client.query('COMMIT');

    // Broadcast to game channel
    const gameChannel = `game:${gameId}`;

    const message = {
      type: 'event' as const,
      channel: gameChannel,
      event: 'GameCompleted',
      data: {
        gameId: gameId.toString(),
        winners: winners.map((w: string) => w.toLowerCase()),
        prizePerWinner: prizePerWinner.toString(),
        platformFee: platformFee.toString(),
        winnerCount: winners.length,
      },
      timestamp: Date.now(),
    };

    broadcaster.broadcast(roomManager.getSubscribers(gameChannel), message);

    logger.info(
      {
        gameId: gameId.toString(),
        winnerCount: winners.length,
        prizePerWinner: prizePerWinner.toString(),
      },
      'GameCompleted event processed'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, gameId: gameId.toString() }, 'Failed to handle GameCompleted');
    throw error;
  } finally {
    client.release();
  }
}
