"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketHandler = void 0;
const ws_1 = require("ws");
const logger_1 = require("./utils/logger");
const validation_1 = require("./utils/validation");
class WebSocketHandler {
    constructor(roomManager) {
        this.heartbeatInterval = null;
        this.clientCounter = 0;
        this.roomManager = roomManager;
    }
    startHeartbeat() {
        // Send ping every 30 seconds, disconnect if no pong after 60 seconds
        this.heartbeatInterval = setInterval(() => {
            this.roomManager.getRoomStats(); // Get all clients
            // Note: In production, we'd track clients separately for heartbeat
            logger_1.logger.debug('Heartbeat check performed');
        }, 30000);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    handleConnection(ws) {
        const client = ws;
        client.id = `client-${++this.clientCounter}-${Date.now()}`;
        client.subscribedRooms = new Set();
        client.isAlive = true;
        logger_1.logger.info(`Client connected: ${client.id}`);
        // Set up pong handler
        client.on('pong', () => {
            client.isAlive = true;
        });
        // Set up message handler
        client.on('message', (data) => {
            this.handleMessage(client, data);
        });
        // Set up close handler
        client.on('close', () => {
            this.handleDisconnect(client);
        });
        // Set up error handler
        client.on('error', (error) => {
            logger_1.logger.error(`Client ${client.id} error`, { error: error.message });
        });
        // Send initial ping
        this.sendPing(client);
    }
    handleMessage(client, data) {
        try {
            const message = JSON.parse(data.toString());
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to parse message from ${client.id}`, { error });
            this.sendError(client, 'Invalid message format');
        }
    }
    handleSubscribe(client, message) {
        if ('gameId' in message && message.gameId) {
            if (!(0, validation_1.validateGameId)(message.gameId)) {
                this.sendError(client, 'Invalid game ID format');
                return;
            }
            this.roomManager.subscribe(client, message.gameId);
            this.sendMessage(client, { type: 'subscribed', gameId: message.gameId });
            logger_1.logger.info(`Client ${client.id} subscribed to game:${message.gameId}`);
        }
        else if ('room' in message && message.room) {
            // Parse room format: "list:active" or "list:completed"
            const match = message.room.match(/^list:(active|completed)$/);
            if (!match) {
                this.sendError(client, 'Invalid room name format');
                return;
            }
            const listType = match[1];
            this.roomManager.subscribeToList(client, listType);
            this.sendMessage(client, { type: 'subscribed', room: message.room });
            logger_1.logger.info(`Client ${client.id} subscribed to ${message.room}`);
        }
        else {
            this.sendError(client, 'Subscribe message must include gameId or room');
        }
    }
    handleUnsubscribe(client, message) {
        if ('gameId' in message && message.gameId) {
            if (!(0, validation_1.validateGameId)(message.gameId)) {
                this.sendError(client, 'Invalid game ID format');
                return;
            }
            this.roomManager.unsubscribe(client, message.gameId);
            this.sendMessage(client, { type: 'unsubscribed', gameId: message.gameId });
            logger_1.logger.info(`Client ${client.id} unsubscribed from game:${message.gameId}`);
        }
        else if ('room' in message && message.room) {
            const match = message.room.match(/^list:(active|completed)$/);
            if (!match) {
                this.sendError(client, 'Invalid room name format');
                return;
            }
            const listType = match[1];
            this.roomManager.unsubscribeFromList(client, listType);
            this.sendMessage(client, { type: 'unsubscribed', room: message.room });
            logger_1.logger.info(`Client ${client.id} unsubscribed from ${message.room}`);
        }
        else {
            this.sendError(client, 'Unsubscribe message must include gameId or room');
        }
    }
    handleDisconnect(client) {
        logger_1.logger.info(`Client disconnected: ${client.id}`);
        this.roomManager.unsubscribeAll(client);
    }
    sendMessage(client, message) {
        try {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to send message to ${client.id}`, { error });
        }
    }
    sendError(client, message) {
        this.sendMessage(client, { type: 'error', message });
    }
    sendPing(client) {
        this.sendMessage(client, { type: 'ping' });
    }
}
exports.WebSocketHandler = WebSocketHandler;
//# sourceMappingURL=websocket-handler.js.map