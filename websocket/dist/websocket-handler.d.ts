import { WebSocket } from 'ws';
import { RoomManager } from './room-manager';
export declare class WebSocketHandler {
    private roomManager;
    private heartbeatInterval;
    private clientCounter;
    constructor(roomManager: RoomManager);
    startHeartbeat(): void;
    stopHeartbeat(): void;
    handleConnection(ws: WebSocket): void;
    private handleMessage;
    private handleSubscribe;
    private handleUnsubscribe;
    private handleDisconnect;
    private sendMessage;
    private sendError;
    private sendPing;
}
//# sourceMappingURL=websocket-handler.d.ts.map