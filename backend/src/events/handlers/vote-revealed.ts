import type { Pool } from 'pg';
import { logger } from '../../utils/logger.js';
import type { Broadcaster } from '../../websocket/broadcaster.js';
import type { RoomManager } from '../../websocket/rooms.js';

export async function handleVoteRevealed(
  log: any,
  db: Pool,
  roomManager: RoomManager,
  broadcaster: Broadcaster
) {
  const { gameId, round, player, vote } = log.args;
  const timestamp = new Date().toISOString();

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO votes (game_id, round, player_address, vote, revealed_at, block_number, transaction_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (game_id, round, player_address) DO NOTHING`,
      [
        gameId.toString(),
        round,
        player.toLowerCase(),
        vote,
        timestamp,
        log.blockNumber.toString(),
        log.transactionHash,
      ]
    );

    await client.query('COMMIT');

    // Broadcast to game and round channels
    const gameChannel = `game:${gameId}`;
    const roundChannel = `game:${gameId}:round:${round}`;

    const voteText = vote ? 'YES' : 'NO';
    const message = {
      type: 'event' as const,
      channel: gameChannel,
      event: 'VoteRevealed',
      data: {
        gameId: gameId.toString(),
        round,
        player: player.toLowerCase(),
        vote,
        voteText,
      },
      timestamp: Date.now(),
    };

    broadcaster.broadcast(roomManager.getSubscribers(gameChannel), message);
    broadcaster.broadcast(roomManager.getSubscribers(roundChannel), message);

    logger.info(
      { gameId: gameId.toString(), round, player: player.toLowerCase(), vote: voteText },
      'VoteRevealed event processed'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, gameId: gameId.toString() }, 'Failed to handle VoteRevealed');
    throw error;
  } finally {
    client.release();
  }
}
