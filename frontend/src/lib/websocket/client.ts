import { WEBSOCKET_CONFIG } from './config';
import {
  ClientMessage,
  ServerMessage,
  GameEventType,
  ConnectionStatus,
  EventHandler,
} from './types';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private subscribedRooms: Set<string> = new Set();

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    console.log('[WS] Connecting to:', WEBSOCKET_CONFIG.url);
    this.updateStatus(ConnectionStatus.CONNECTING);

    try {
      this.ws = new WebSocket(WEBSOCKET_CONFIG.url);

      this.ws.onopen = () => {
        this.handleOpen();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onerror = (error) => {
        this.handleError(error);
      };

      this.ws.onclose = () => {
        this.handleClose();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimeout();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.subscribedRooms.clear();
    this.updateStatus(ConnectionStatus.DISCONNECTED);
  }

  subscribe(gameId: string): void {
    console.log('[WS] subscribe() called for game:', gameId, 'status:', this.status);
    this.subscribedRooms.add(`game:${gameId}`);

    if (this.status === ConnectionStatus.CONNECTED) {
      console.log('[WS] Sending subscribe message for game:', gameId);
      this.send({ type: 'subscribe', gameId });
    } else {
      console.log('[WS] Not connected, will subscribe on reconnect');
    }
  }

  subscribeToList(listType: 'active' | 'completed'): void {
    const room = `list:${listType}`;
    this.subscribedRooms.add(room);

    if (this.status === ConnectionStatus.CONNECTED) {
      this.send({ type: 'subscribe', room });
    }
  }

  unsubscribe(gameId: string): void {
    this.subscribedRooms.delete(`game:${gameId}`);

    if (this.status === ConnectionStatus.CONNECTED) {
      this.send({ type: 'unsubscribe', gameId });
    }
  }

  unsubscribeFromList(listType: 'active' | 'completed'): void {
    const room = `list:${listType}`;
    this.subscribedRooms.delete(room);

    if (this.status === ConnectionStatus.CONNECTED) {
      this.send({ type: 'unsubscribe', room });
    }
  }

  on(eventType: GameEventType | 'connection', handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  off(eventType: GameEventType | 'connection', handler: EventHandler): void {
    this.eventHandlers.get(eventType)?.delete(handler);
  }

  onStatusChange(listener: (status: ConnectionStatus) => void): void {
    this.statusListeners.add(listener);
  }

  offStatusChange(listener: (status: ConnectionStatus) => void): void {
    this.statusListeners.delete(listener);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private handleOpen(): void {
    console.log('[WS] ✅ Connected to:', WEBSOCKET_CONFIG.url);
    this.reconnectAttempts = 0;
    this.updateStatus(ConnectionStatus.CONNECTED);
    this.startHeartbeat();

    // Resubscribe to all rooms
    console.log('[WS] Resubscribing to rooms:', Array.from(this.subscribedRooms));
    for (const room of this.subscribedRooms) {
      if (room.startsWith('game:')) {
        const gameId = room.replace('game:', '');
        console.log('[WS] Subscribing to game:', gameId);
        this.send({ type: 'subscribe', gameId });
      } else if (room.startsWith('list:')) {
        console.log('[WS] Subscribing to list:', room);
        this.send({ type: 'subscribe', room });
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: ServerMessage = JSON.parse(event.data);
      console.log('[WS] Message received:', message.type, message);

      switch (message.type) {
        case 'ping':
          this.send({ type: 'pong' });
          break;

        case 'event':
          console.log('[WS] 🎮 Game event:', message.eventType, message.gameId, message.data);
          this.handleEvent(message);
          break;

        case 'subscribed':
          console.log('[WS] ✅ Subscribed to:', message.gameId || message.room);
          break;

        case 'unsubscribed':
          console.log('[WS] Unsubscribed from:', message.gameId || message.room);
          break;

        case 'error':
          console.error('[WS] ❌ Server error:', message.message);
          break;
      }
    } catch (error) {
      console.error('[WS] Failed to parse message:', error, event.data);
    }
  }

  private handleEvent(message: ServerMessage & { type: 'event' }): void {
    const { eventType, data } = message;

    // Call event-specific handlers
    const handlers = this.eventHandlers.get(eventType as GameEventType);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${eventType} handler:`, error);
        }
      }
    }

    // Call connection event handlers (for all events)
    const connectionHandlers = this.eventHandlers.get('connection');
    if (connectionHandlers) {
      for (const handler of connectionHandlers) {
        try {
          handler({ eventType, data });
        } catch (error) {
          console.error('Error in connection handler:', error);
        }
      }
    }
  }

  private handleError(error: Event): void {
    console.error('[WS] ❌ Connection error:', error);
    this.updateStatus(ConnectionStatus.ERROR);
  }

  private handleClose(): void {
    console.log('[WS] Connection closed');
    this.stopHeartbeat();
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= WEBSOCKET_CONFIG.reconnect.maxAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    this.updateStatus(ConnectionStatus.RECONNECTING);

    const delay = Math.min(
      WEBSOCKET_CONFIG.reconnect.initialDelay *
        Math.pow(WEBSOCKET_CONFIG.reconnect.backoffMultiplier, this.reconnectAttempts),
      WEBSOCKET_CONFIG.reconnect.maxDelay
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Heartbeat is handled by server's ping messages
        // Client just responds with pong
      }
    }, WEBSOCKET_CONFIG.heartbeat.interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private send(message: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}

// Singleton instance for convenience
let globalClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!globalClient) {
    globalClient = new WebSocketClient();
  }
  return globalClient;
}
