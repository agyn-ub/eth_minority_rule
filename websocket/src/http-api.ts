import express, { Request, Response } from 'express';
import { RoomManager } from './room-manager';
import { NotificationPayload, ServerMessage } from './types';
import { logger } from './utils/logger';
import { validateNotificationPayload } from './utils/validation';

export function createHttpApi(roomManager: RoomManager): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // CORS - allow all origins in development, restrict in production
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
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
  app.post('/api/notify', async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      // Validate payload
      if (!validateNotificationPayload(payload)) {
        logger.warn('Invalid notification payload received', { payload });
        res.status(400).json({ error: 'Invalid payload format' });
        return;
      }

      const { eventType, gameId, data } = payload as NotificationPayload;

      logger.info(`Received notification: ${eventType}`, { gameId });

      // Create event message
      const message: ServerMessage = {
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
      } else if (eventType === 'GameCompleted') {
        roomManager.broadcastToList('active', message);
        roomManager.broadcastToList('completed', message);
      }

      // Return 202 Accepted (async processing)
      res.status(202).json({ status: 'accepted' });
    } catch (error) {
      logger.error('Error processing notification', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
