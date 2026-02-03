import { WebSocket } from 'ws';
export type ClientMessage = {
    type: 'subscribe';
    gameId: string;
} | {
    type: 'subscribe';
    room: string;
} | {
    type: 'unsubscribe';
    gameId: string;
} | {
    type: 'unsubscribe';
    room: string;
} | {
    type: 'pong';
};
export type ServerMessage = {
    type: 'subscribed';
    gameId?: string;
    room?: string;
} | {
    type: 'unsubscribed';
    gameId?: string;
    room?: string;
} | {
    type: 'event';
    eventType: string;
    gameId: string;
    data: any;
    timestamp: string;
} | {
    type: 'ping';
} | {
    type: 'error';
    message: string;
};
export interface NotificationPayload {
    eventType: string;
    gameId: string;
    data: any;
}
export interface WSClient extends WebSocket {
    id: string;
    subscribedRooms: Set<string>;
    isAlive: boolean;
}
export type RoomId = `game:${string}` | `list:${string}`;
export type GameEventType = 'GameCreated' | 'PlayerJoined' | 'VoteCommitted' | 'VoteRevealed' | 'RoundCompleted' | 'GameCompleted' | 'CommitPhaseStarted' | 'RevealPhaseStarted';
//# sourceMappingURL=types.d.ts.map