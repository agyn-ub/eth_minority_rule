import { WSClient, ServerMessage } from './types';
export declare class RoomManager {
    private rooms;
    subscribe(client: WSClient, gameId: string): void;
    subscribeToList(client: WSClient, listType: 'active' | 'completed'): void;
    unsubscribe(client: WSClient, gameId: string): void;
    unsubscribeFromList(client: WSClient, listType: 'active' | 'completed'): void;
    unsubscribeAll(client: WSClient): void;
    broadcast(gameId: string, message: ServerMessage): void;
    broadcastToList(listType: 'active' | 'completed', message: ServerMessage): void;
    getTotalConnections(): number;
    getRoomStats(): Record<string, number>;
}
//# sourceMappingURL=room-manager.d.ts.map