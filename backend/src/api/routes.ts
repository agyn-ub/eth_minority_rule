import type { FastifyInstance } from 'fastify';
import { checkDatabaseConnection } from '../db/client.js';
import type { RoomManager } from '../websocket/rooms.js';

export function setupRoutes(fastify: FastifyInstance, roomManager: RoomManager) {
  fastify.get('/health', async (request, reply) => {
    const dbHealthy = await checkDatabaseConnection();
    return {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: Date.now(),
      database: dbHealthy ? 'up' : 'down',
      websocketConnections: roomManager.getConnectionCount(),
    };
  });

  fastify.get('/metrics', async (request, reply) => {
    return {
      websocketConnections: roomManager.getConnectionCount(),
      uptime: process.uptime(),
    };
  });
}
