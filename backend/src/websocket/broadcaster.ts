import type { WebSocketClient, BroadcastMessage } from '../utils/types.js';
import { logger } from '../utils/logger.js';

export class Broadcaster {
  broadcast(clients: Set<WebSocketClient>, message: BroadcastMessage) {
    const payload = JSON.stringify(message);
    let successCount = 0;
    let failCount = 0;

    for (const client of clients) {
      if (client.readyState === 1) { // OPEN
        try {
          client.send(payload);
          successCount++;
        } catch (error) {
          failCount++;
          logger.error({ error, channel: message.channel }, 'Failed to send message');
        }
      }
    }

    logger.debug(
      { channel: message.channel, event: message.event, successCount, failCount },
      'Broadcast complete'
    );
  }
}
