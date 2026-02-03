"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const http_api_1 = require("./http-api");
const websocket_handler_1 = require("./websocket-handler");
const room_manager_1 = require("./room-manager");
const logger_1 = require("./utils/logger");
const PORT = parseInt(process.env.PORT || '3001', 10);
// Initialize components
const roomManager = new room_manager_1.RoomManager();
const wsHandler = new websocket_handler_1.WebSocketHandler(roomManager);
const app = (0, http_api_1.createHttpApi)(roomManager);
// Create HTTP server
const server = http_1.default.createServer(app);
// Create WebSocket server
const wss = new ws_1.WebSocketServer({ server });
// Handle WebSocket connections
wss.on('connection', (ws) => {
    wsHandler.handleConnection(ws);
});
// Start heartbeat
wsHandler.startHeartbeat();
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    wsHandler.stopHeartbeat();
    wss.clients.forEach((client) => {
        client.close(1000, 'Server shutting down');
    });
    server.close(() => {
        logger_1.logger.info('Server closed');
        process.exit(0);
    });
    // Force exit after 10 seconds
    setTimeout(() => {
        logger_1.logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    wsHandler.stopHeartbeat();
    wss.clients.forEach((client) => {
        client.close(1000, 'Server shutting down');
    });
    server.close(() => {
        logger_1.logger.info('Server closed');
        process.exit(0);
    });
});
// Start server
server.listen(PORT, () => {
    logger_1.logger.info(`✅ WebSocket server listening on port ${PORT}`);
    logger_1.logger.info(`HTTP API: http://localhost:${PORT}`);
    logger_1.logger.info(`WebSocket: ws://localhost:${PORT}`);
    logger_1.logger.info(`Health check: http://localhost:${PORT}/health`);
});
// Error handling
server.on('error', (error) => {
    logger_1.logger.error('Server error', { error });
    process.exit(1);
});
wss.on('error', (error) => {
    logger_1.logger.error('WebSocket server error', { error });
});
//# sourceMappingURL=server.js.map