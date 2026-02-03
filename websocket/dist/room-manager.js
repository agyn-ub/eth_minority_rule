"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const logger_1 = require("./utils/logger");
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    subscribe(client, gameId) {
        const roomId = `game:${gameId}`;
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(client);
        client.subscribedRooms.add(roomId);
        logger_1.logger.debug(`Client ${client.id} subscribed to ${roomId}`, {
            totalInRoom: this.rooms.get(roomId).size,
        });
    }
    subscribeToList(client, listType) {
        const roomId = `list:${listType}`;
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(client);
        client.subscribedRooms.add(roomId);
        logger_1.logger.debug(`Client ${client.id} subscribed to ${roomId}`, {
            totalInRoom: this.rooms.get(roomId).size,
        });
    }
    unsubscribe(client, gameId) {
        const roomId = `game:${gameId}`;
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(client);
            // Clean up empty rooms
            if (this.rooms.get(roomId).size === 0) {
                this.rooms.delete(roomId);
                logger_1.logger.debug(`Removed empty room ${roomId}`);
            }
        }
        client.subscribedRooms.delete(roomId);
        logger_1.logger.debug(`Client ${client.id} unsubscribed from ${roomId}`);
    }
    unsubscribeFromList(client, listType) {
        const roomId = `list:${listType}`;
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(client);
            if (this.rooms.get(roomId).size === 0) {
                this.rooms.delete(roomId);
                logger_1.logger.debug(`Removed empty room ${roomId}`);
            }
        }
        client.subscribedRooms.delete(roomId);
        logger_1.logger.debug(`Client ${client.id} unsubscribed from ${roomId}`);
    }
    unsubscribeAll(client) {
        for (const roomId of client.subscribedRooms) {
            if (this.rooms.has(roomId)) {
                this.rooms.get(roomId).delete(client);
                if (this.rooms.get(roomId).size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        }
        client.subscribedRooms.clear();
        logger_1.logger.debug(`Client ${client.id} unsubscribed from all rooms`);
    }
    broadcast(gameId, message) {
        const roomId = `game:${gameId}`;
        if (!this.rooms.has(roomId)) {
            logger_1.logger.debug(`No clients subscribed to ${roomId}`);
            return;
        }
        const clients = this.rooms.get(roomId);
        const messageStr = JSON.stringify(message);
        let successCount = 0;
        let failCount = 0;
        for (const client of clients) {
            try {
                if (client.readyState === 1) { // WebSocket.OPEN
                    client.send(messageStr);
                    successCount++;
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to send message to client ${client.id}`, { error });
                failCount++;
            }
        }
        logger_1.logger.info(`Broadcast to ${roomId}`, {
            successCount,
            failCount,
            totalClients: clients.size,
        });
    }
    broadcastToList(listType, message) {
        const roomId = `list:${listType}`;
        if (!this.rooms.has(roomId)) {
            logger_1.logger.debug(`No clients subscribed to ${roomId}`);
            return;
        }
        const clients = this.rooms.get(roomId);
        const messageStr = JSON.stringify(message);
        let successCount = 0;
        let failCount = 0;
        for (const client of clients) {
            try {
                if (client.readyState === 1) {
                    client.send(messageStr);
                    successCount++;
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to send message to client ${client.id}`, { error });
                failCount++;
            }
        }
        logger_1.logger.info(`Broadcast to ${roomId}`, {
            successCount,
            failCount,
            totalClients: clients.size,
        });
    }
    getTotalConnections() {
        let total = 0;
        for (const clients of this.rooms.values()) {
            total += clients.size;
        }
        return total;
    }
    getRoomStats() {
        const stats = {};
        for (const [roomId, clients] of this.rooms) {
            stats[roomId] = clients.size;
        }
        return stats;
    }
}
exports.RoomManager = RoomManager;
//# sourceMappingURL=room-manager.js.map