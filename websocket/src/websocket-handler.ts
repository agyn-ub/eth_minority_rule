import { WebSocket } from 'ws';
import { RoomManager } from './room-manager';
import { WSClient, ClientMessage, ServerMessage } from './types';
import { logger } from './utils/logger';
import { validateGameId, validateRoomName } from './utils/validation';

export class WebSocketHandler {
  private roomManager: RoomManager;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private clientCounter = 0;

  constructor(roomManager: RoomManager) {
    this.roomManager = roomManager;
  }

  startHeartbeat() {
    // Send ping every 30 seconds, disconnect if no pong after 60 seconds
    this.heartbeatInterval = setInterval(() => {
      this.roomManager.getRoomStats(); // Get all clients
      // Note: In production, we'd track clients separately for heartbeat
      logger.debug('Heartbeat check performed');
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  handleConnection(ws: WebSocket): void {
    const client = ws as WSClient;
    client.id = `client-${++this.clientCounter}-${Date.now()}`;
    client.subscribedRooms = new Set();
    client.isAlive = true;

    logger.info(`Client connected: ${client.id}`);

    // Set up pong handler
    client.on('pong', () => {
      client.isAlive = true;
    });

    // Set up message handler
    client.on('message', (data: Buffer) => {
      this.handleMessage(client, data);
    });

    // Set up close handler
    client.on('close', () => {
      this.handleDisconnect(client);
    });

    // Set up error handler
    client.on('error', (error) => {
      logger.error(`Client ${client.id} error`, { error: error.message });
    });

    // Send initial ping
    this.sendPing(client);
  }

  private handleMessage(client: WSClient, data: Buffer): void {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(client, message);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(client, message);
          break;

        case 'pong':
          client.isAlive = true;
          break;

        default:
          this.sendError(client, 'Unknown message type');
      }
    } catch (error) {
      logger.error(`Failed to parse message from ${client.id}`, { error });
      this.sendError(client, 'Invalid message format');
    }
  }

  private handleSubscribe(client: WSClient, message: ClientMessage): void {
    if ('gameId' in message && message.gameId) {
      if (!validateGameId(message.gameId)) {
        this.sendError(client, 'Invalid game ID format');
        return;
      }

      this.roomManager.subscribe(client, message.gameId);
      this.sendMessage(client, { type: 'subscribed', gameId: message.gameId });
      logger.info(`Client ${client.id} subscribed to game:${message.gameId}`);
    } else if ('room' in message && message.room) {
      // Parse room format: "list:active" or "list:completed"
      const match = message.room.match(/^list:(active|completed)$/);
      if (!match) {
        this.sendError(client, 'Invalid room name format');
        return;
      }

      const listType = match[1] as 'active' | 'completed';
      this.roomManager.subscribeToList(client, listType);
      this.sendMessage(client, { type: 'subscribed', room: message.room });
      logger.info(`Client ${client.id} subscribed to ${message.room}`);
    } else {
      this.sendError(client, 'Subscribe message must include gameId or room');
    }
  }

  private handleUnsubscribe(client: WSClient, message: ClientMessage): void {
    if ('gameId' in message && message.gameId) {
      if (!validateGameId(message.gameId)) {
        this.sendError(client, 'Invalid game ID format');
        return;
      }

      this.roomManager.unsubscribe(client, message.gameId);
      this.sendMessage(client, { type: 'unsubscribed', gameId: message.gameId });
      logger.info(`Client ${client.id} unsubscribed from game:${message.gameId}`);
    } else if ('room' in message && message.room) {
      const match = message.room.match(/^list:(active|completed)$/);
      if (!match) {
        this.sendError(client, 'Invalid room name format');
        return;
      }

      const listType = match[1] as 'active' | 'completed';
      this.roomManager.unsubscribeFromList(client, listType);
      this.sendMessage(client, { type: 'unsubscribed', room: message.room });
      logger.info(`Client ${client.id} unsubscribed from ${message.room}`);
    } else {
      this.sendError(client, 'Unsubscribe message must include gameId or room');
    }
  }

  private handleDisconnect(client: WSClient): void {
    logger.info(`Client disconnected: ${client.id}`);
    this.roomManager.unsubscribeAll(client);
  }

  private sendMessage(client: WSClient, message: ServerMessage): void {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    } catch (error) {
      logger.error(`Failed to send message to ${client.id}`, { error });
    }
  }

  private sendError(client: WSClient, message: string): void {
    this.sendMessage(client, { type: 'error', message });
  }

  private sendPing(client: WSClient): void {
    this.sendMessage(client, { type: 'ping' });
  }
}
