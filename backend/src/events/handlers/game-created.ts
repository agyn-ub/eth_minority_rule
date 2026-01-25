import type { Pool } from 'pg';
import { logger } from '../../utils/logger.js';
import type { Broadcaster } from '../../websocket/broadcaster.js';
import type { RoomManager } from '../../websocket/rooms.js';

export async function handleGameCreated(
  log: any,
  db: Pool,
  roomManager: RoomManager,
  broadcaster: Broadcaster
) {
  const { gameId, entryFee, creator, questionText, phase } = log.args;
  const timestamp = new Date().toISOString(); // Use current time since block timestamp not available in watchContractEvent

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO games (game_id, question_text, entry_fee, creator_address, state, current_round, total_players, prize_pool, created_at, updated_at, block_number, transaction_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (game_id) DO NOTHING`,
      [
        gameId.toString(),
        questionText,
        entryFee.toString(),
        creator.toLowerCase(),
        'ZeroPhase',
        1,
        0,
        '0',
        timestamp,
        timestamp,
        log.blockNumber.toString(),
        log.transactionHash,
      ]
    );

    await client.query('COMMIT');

    // Broadcast to 'global' channel
    const subscribers = roomManager.getSubscribers('global');
    broadcaster.broadcast(subscribers, {
      type: 'event',
      channel: 'global',
      event: 'GameCreated',
      data: {
        gameId: gameId.toString(),
        questionText,
        entryFee: entryFee.toString(),
        creator: creator.toLowerCase(),
      },
      timestamp: Date.now(),
    });

    logger.info({ gameId: gameId.toString(), creator }, 'GameCreated event processed');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, gameId: gameId.toString() }, 'Failed to handle GameCreated');
    throw error;
  } finally {
    client.release();
  }
}
