import type { WebSocketClient } from '../utils/types.js';
import { logger } from '../utils/logger.js';

export class RoomManager {
  private rooms = new Map<string, Set<WebSocketClient>>();

  subscribe(client: WebSocketClient, channel: string) {
    if (!this.rooms.has(channel)) {
      this.rooms.set(channel, new Set());
    }
    this.rooms.get(channel)!.add(client);
    client.subscriptions.add(channel);
    logger.info({ channel, total: this.rooms.get(channel)!.size }, 'Client subscribed');
  }

  unsubscribe(client: WebSocketClient, channel: string) {
    const room = this.rooms.get(channel);
    if (room) {
      room.delete(client);
      client.subscriptions.delete(channel);
      if (room.size === 0) {
        this.rooms.delete(channel);
      }
      logger.info({ channel }, 'Client unsubscribed');
    }
  }

  unsubscribeAll(client: WebSocketClient) {
    for (const channel of client.subscriptions) {
      this.unsubscribe(client, channel);
    }
  }

  getSubscribers(channel: string): Set<WebSocketClient> {
    return this.rooms.get(channel) || new Set();
  }

  getConnectionCount(): number {
    const clients = new Set<WebSocketClient>();
    for (const room of this.rooms.values()) {
      for (const client of room) {
        clients.add(client);
      }
    }
    return clients.size;
  }
}
