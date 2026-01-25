import type { Pool } from 'pg';
import { logger } from '../../utils/logger.js';
import type { Broadcaster } from '../../websocket/broadcaster.js';
import type { RoomManager } from '../../websocket/rooms.js';

export async function handleVoteCommitted(
  log: any,
  db: Pool,
  roomManager: RoomManager,
  broadcaster: Broadcaster
) {
  const { gameId, round, player, commitHash } = log.args;
  const timestamp = new Date().toISOString();

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO commits (game_id, round, player_address, commit_hash, committed_at, block_number, transaction_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (game_id, round, player_address) DO NOTHING`,
      [
        gameId.toString(),
        round,
        player.toLowerCase(),
        commitHash,
        timestamp,
        log.blockNumber.toString(),
        log.transactionHash,
      ]
    );

    await client.query('COMMIT');

    // Broadcast to game and round channels
    const gameChannel = `game:${gameId}`;
    const roundChannel = `game:${gameId}:round:${round}`;

    const message = {
      type: 'event' as const,
      channel: gameChannel,
      event: 'VoteCommitted',
      data: {
        gameId: gameId.toString(),
        round,
        player: player.toLowerCase(),
        commitHash,
      },
      timestamp: Date.now(),
    };

    broadcaster.broadcast(roomManager.getSubscribers(gameChannel), message);
    broadcaster.broadcast(roomManager.getSubscribers(roundChannel), message);

    logger.info(
      { gameId: gameId.toString(), round, player: player.toLowerCase() },
      'VoteCommitted event processed'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, gameId: gameId.toString() }, 'Failed to handle VoteCommitted');
    throw error;
  } finally {
    client.release();
  }
}
