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

// Connection status
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

// Event handler callback
export type EventHandler = (data: any) => void;
