import type { FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import type { WebSocketClient } from '../utils/types.js';
import { RoomManager } from './rooms.js';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';

export function setupWebSocket(fastify: FastifyInstance, roomManager: RoomManager) {
  fastify.register(fastifyWebsocket);

  fastify.get('/ws', { websocket: true }, (socket, req) => {
    const client = socket as WebSocketClient;
    client.subscriptions = new Set();
    client.isAlive = true;

    logger.info('WebSocket client connected');

    client.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'subscribe' && message.channel) {
          roomManager.subscribe(client, message.channel);
          client.send(JSON.stringify({ type: 'subscribed', channel: message.channel }));
        } else if (message.type === 'unsubscribe' && message.channel) {
          roomManager.unsubscribe(client, message.channel);
          client.send(JSON.stringify({ type: 'unsubscribed', channel: message.channel }));
        } else if (message.type === 'ping') {
          client.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        logger.error({ error }, 'Failed to parse WebSocket message');
      }
    });

    client.on('pong', () => {
      client.isAlive = true;
    });

    client.on('close', () => {
      roomManager.unsubscribeAll(client);
      logger.info('WebSocket client disconnected');
    });

    client.on('error', (error) => {
      logger.error({ error }, 'WebSocket client error');
    });
  });

  // Heartbeat to detect stale connections
  const heartbeat = setInterval(() => {
    if (!fastify.websocketServer) return;

    fastify.websocketServer.clients.forEach((ws) => {
      const client = ws as WebSocketClient;
      if (client.isAlive === false) {
        logger.info('Terminating stale WebSocket connection');
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, config.websocket.heartbeatInterval);

  fastify.addHook('onClose', () => {
    clearInterval(heartbeat);
  });
}
