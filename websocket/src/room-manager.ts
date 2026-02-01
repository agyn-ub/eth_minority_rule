import { WSClient, ServerMessage, RoomId } from './types';
import { logger } from './utils/logger';

export class RoomManager {
  private rooms: Map<RoomId, Set<WSClient>> = new Map();

  subscribe(client: WSClient, gameId: string): void {
    const roomId: RoomId = `game:${gameId}`;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    this.rooms.get(roomId)!.add(client);
    client.subscribedRooms.add(roomId);

    logger.debug(`Client ${client.id} subscribed to ${roomId}`, {
      totalInRoom: this.rooms.get(roomId)!.size,
    });
  }

  subscribeToList(client: WSClient, listType: 'active' | 'completed'): void {
    const roomId: RoomId = `list:${listType}`;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    this.rooms.get(roomId)!.add(client);
    client.subscribedRooms.add(roomId);

    logger.debug(`Client ${client.id} subscribed to ${roomId}`, {
      totalInRoom: this.rooms.get(roomId)!.size,
    });
  }

  unsubscribe(client: WSClient, gameId: string): void {
    const roomId: RoomId = `game:${gameId}`;

    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId)!.delete(client);

      // Clean up empty rooms
      if (this.rooms.get(roomId)!.size === 0) {
        this.rooms.delete(roomId);
        logger.debug(`Removed empty room ${roomId}`);
      }
    }

    client.subscribedRooms.delete(roomId);
    logger.debug(`Client ${client.id} unsubscribed from ${roomId}`);
  }

  unsubscribeFromList(client: WSClient, listType: 'active' | 'completed'): void {
    const roomId: RoomId = `list:${listType}`;

    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId)!.delete(client);

      if (this.rooms.get(roomId)!.size === 0) {
        this.rooms.delete(roomId);
        logger.debug(`Removed empty room ${roomId}`);
      }
    }

    client.subscribedRooms.delete(roomId);
    logger.debug(`Client ${client.id} unsubscribed from ${roomId}`);
  }

  unsubscribeAll(client: WSClient): void {
    for (const roomId of client.subscribedRooms) {
      if (this.rooms.has(roomId as RoomId)) {
        this.rooms.get(roomId as RoomId)!.delete(client);

        if (this.rooms.get(roomId as RoomId)!.size === 0) {
          this.rooms.delete(roomId as RoomId);
        }
      }
    }

    client.subscribedRooms.clear();
    logger.debug(`Client ${client.id} unsubscribed from all rooms`);
  }

  broadcast(gameId: string, message: ServerMessage): void {
    const roomId: RoomId = `game:${gameId}`;

    if (!this.rooms.has(roomId)) {
      logger.debug(`No clients subscribed to ${roomId}`);
      return;
    }

    const clients = this.rooms.get(roomId)!;
    const messageStr = JSON.stringify(message);
    let successCount = 0;
    let failCount = 0;

    for (const client of clients) {
      try {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(messageStr);
          successCount++;
        }
      } catch (error) {
        logger.error(`Failed to send message to client ${client.id}`, { error });
        failCount++;
      }
    }

    logger.info(`Broadcast to ${roomId}`, {
      successCount,
      failCount,
      totalClients: clients.size,
    });
  }

  broadcastToList(listType: 'active' | 'completed', message: ServerMessage): void {
    const roomId: RoomId = `list:${listType}`;

    if (!this.rooms.has(roomId)) {
      logger.debug(`No clients subscribed to ${roomId}`);
      return;
    }

    const clients = this.rooms.get(roomId)!;
    const messageStr = JSON.stringify(message);
    let successCount = 0;
    let failCount = 0;

    for (const client of clients) {
      try {
        if (client.readyState === 1) {
          client.send(messageStr);
          successCount++;
        }
      } catch (error) {
        logger.error(`Failed to send message to client ${client.id}`, { error });
        failCount++;
      }
    }

    logger.info(`Broadcast to ${roomId}`, {
      successCount,
      failCount,
      totalClients: clients.size,
    });
  }

  getTotalConnections(): number {
    let total = 0;
    for (const clients of this.rooms.values()) {
      total += clients.size;
    }
    return total;
  }

  getRoomStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [roomId, clients] of this.rooms) {
      stats[roomId] = clients.size;
    }
    return stats;
  }
}
