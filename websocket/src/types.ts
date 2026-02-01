import { WebSocket } from 'ws';

// Client-to-server messages
export type ClientMessage =
  | { type: 'subscribe'; gameId: string }
  | { type: 'subscribe'; room: string }
  | { type: 'unsubscribe'; gameId: string }
  | { type: 'unsubscribe'; room: string }
  | { type: 'pong' };

// Server-to-client messages
export type ServerMessage =
  | { type: 'subscribed'; gameId?: string; room?: string }
  | { type: 'unsubscribed'; gameId?: string; room?: string }
  | { type: 'event'; eventType: string; gameId: string; data: any; timestamp: string }
  | { type: 'ping' }
  | { type: 'error'; message: string };

// HTTP API notification payload from Ponder
export interface NotificationPayload {
  eventType: string;
  gameId: string;
  data: any;
}

// WebSocket client with metadata
export interface WSClient extends WebSocket {
  id: string;
  subscribedRooms: Set<string>;
  isAlive: boolean;
}

// Room types
export type RoomId = `game:${string}` | `list:${string}`;

// Event types from contract
export type GameEventType =
  | 'GameCreated'
  | 'PlayerJoined'
  | 'VoteCommitted'
  | 'VoteRevealed'
  | 'RoundCompleted'
  | 'GameCompleted'
  | 'CommitPhaseStarted'
  | 'RevealPhaseStarted';
