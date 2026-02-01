import http from 'http';
import { WebSocketServer } from 'ws';
import { createHttpApi } from './http-api';
import { WebSocketHandler } from './websocket-handler';
import { RoomManager } from './room-manager';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize components
const roomManager = new RoomManager();
const wsHandler = new WebSocketHandler(roomManager);
const app = createHttpApi(roomManager);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  wsHandler.handleConnection(ws);
});

// Start heartbeat
wsHandler.startHeartbeat();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');

  wsHandler.stopHeartbeat();

  wss.clients.forEach((client) => {
    client.close(1000, 'Server shutting down');
  });

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');

  wsHandler.stopHeartbeat();

  wss.clients.forEach((client) => {
    client.close(1000, 'Server shutting down');
  });

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`✅ WebSocket server listening on port ${PORT}`);
  logger.info(`HTTP API: http://localhost:${PORT}`);
  logger.info(`WebSocket: ws://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Error handling
server.on('error', (error) => {
  logger.error('Server error', { error });
  process.exit(1);
});

wss.on('error', (error) => {
  logger.error('WebSocket server error', { error });
});
