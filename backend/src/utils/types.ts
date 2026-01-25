import type { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  subscriptions: Set<string>;
  isAlive: boolean;
}

export interface BroadcastMessage {
  type: 'event';
  channel: string;
  event: string;
  data: any;
  timestamp: number;
}
