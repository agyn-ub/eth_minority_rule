import type { Pool } from 'pg';
import { logger } from '../../utils/logger.js';
import type { Broadcaster } from '../../websocket/broadcaster.js';
import type { RoomManager } from '../../websocket/rooms.js';

export async function handlePlayerJoined(
  log: any,
  db: Pool,
  roomManager: RoomManager,
  broadcaster: Broadcaster
) {
  const { gameId, player, amount, totalPlayers } = log.args;
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
        'Skipping PlayerJoined - game not found in database'
      );
      await client.query('ROLLBACK');
      return;
    }

    // Insert player record
    await client.query(
      `INSERT INTO players (game_id, player_address, joined_amount, joined_at, block_number, transaction_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (game_id, player_address) DO NOTHING`,
      [
        gameId.toString(),
        player.toLowerCase(),
        amount.toString(),
        timestamp,
        log.blockNumber.toString(),
        log.transactionHash,
      ]
    );

    // Update game
    await client.query(
      `UPDATE games
       SET total_players = $1,
           prize_pool = prize_pool::numeric + $2::numeric,
           updated_at = $3
       WHERE game_id = $4`,
      [totalPlayers, amount.toString(), timestamp, gameId.toString()]
    );

    // Insert elimination record with eliminated=false
    await client.query(
      `INSERT INTO eliminations (game_id, player_address, eliminated)
       VALUES ($1, $2, $3)
       ON CONFLICT (game_id, player_address) DO NOTHING`,
      [gameId.toString(), player.toLowerCase(), false]
    );

    await client.query('COMMIT');

    // Broadcast to game channel
    const gameChannel = `game:${gameId}`;
    const playersChannel = `game:${gameId}:players`;

    const message = {
      type: 'event' as const,
      channel: gameChannel,
      event: 'PlayerJoined',
      data: {
        gameId: gameId.toString(),
        player: player.toLowerCase(),
        amount: amount.toString(),
        totalPlayers,
      },
      timestamp: Date.now(),
    };

    broadcaster.broadcast(roomManager.getSubscribers(gameChannel), message);
    broadcaster.broadcast(roomManager.getSubscribers(playersChannel), message);

    logger.info(
      { gameId: gameId.toString(), player: player.toLowerCase() },
      'PlayerJoined event processed'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error, gameId: gameId.toString() }, 'Failed to handle PlayerJoined');
    throw error;
  } finally {
    client.release();
  }
}
