"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpApi = createHttpApi;
const express_1 = __importDefault(require("express"));
const logger_1 = require("./utils/logger");
const validation_1 = require("./utils/validation");
function createHttpApi(roomManager) {
    const app = (0, express_1.default)();
    // Middleware
    app.use(express_1.default.json());
    // CORS - allow all origins in development, restrict in production
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });
    // Health check endpoint
    app.get('/health', (req, res) => {
        const stats = roomManager.getRoomStats();
        const totalConnections = roomManager.getTotalConnections();
        res.json({
            status: 'ok',
            connections: totalConnections,
            rooms: stats,
            timestamp: new Date().toISOString(),
        });
    });
    // Notification endpoint for Ponder
    app.post('/api/notify', async (req, res) => {
        try {
            const payload = req.body;
            // Validate payload
            if (!(0, validation_1.validateNotificationPayload)(payload)) {
                logger_1.logger.warn('Invalid notification payload received', { payload });
                res.status(400).json({ error: 'Invalid payload format' });
                return;
            }
            const { eventType, gameId, data } = payload;
            logger_1.logger.info(`Received notification: ${eventType}`, { gameId });
            // Create event message
            const message = {
                type: 'event',
                eventType,
                gameId,
                data,
                timestamp: new Date().toISOString(),
            };
            // Broadcast to game room
            roomManager.broadcast(gameId, message);
            // Also broadcast to list rooms if relevant
            if (eventType === 'GameCreated') {
                roomManager.broadcastToList('active', message);
            }
            else if (eventType === 'GameCompleted') {
                roomManager.broadcastToList('active', message);
                roomManager.broadcastToList('completed', message);
            }
            // Return 202 Accepted (async processing)
            res.status(202).json({ status: 'accepted' });
        }
        catch (error) {
            logger_1.logger.error('Error processing notification', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
    return app;
}
//# sourceMappingURL=http-api.js.map