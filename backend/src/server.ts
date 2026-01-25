import Fastify from 'fastify';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { RoomManager } from './websocket/rooms.js';
import { Broadcaster } from './websocket/broadcaster.js';
import { setupWebSocket } from './websocket/server.js';
import { setupRoutes } from './api/routes.js';
import { startEventListener } from './events/listener.js';
import { checkDatabaseConnection } from './db/client.js';

async function start() {
  const fastify = Fastify({
    logger: true,
  });

  // Check database connection first
  logger.info('Checking database connection...');
  const dbHealthy = await checkDatabaseConnection();
  if (!dbHealthy) {
    logger.error('Database connection failed - cannot start server');
    process.exit(1);
  }
  logger.info('Database connection successful');

  const roomManager = new RoomManager();
  const broadcaster = new Broadcaster();

  // Setup routes
  setupRoutes(fastify, roomManager);

  // Setup WebSocket
  setupWebSocket(fastify, roomManager);

  // Start event listener
  await startEventListener(roomManager, broadcaster);

  // Start server
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Server listening on port ${config.port}`);
    logger.info(`WebSocket available at ws://localhost:${config.port}/ws`);
    logger.info(`Health check at http://localhost:${config.port}/health`);
    logger.info(`Metrics at http://localhost:${config.port}/metrics`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutdown signal received, shutting down gracefully...');
    await fastify.close();
    logger.info('Server closed');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
