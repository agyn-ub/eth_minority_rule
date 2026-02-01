/**
 * Fire-and-forget WebSocket notification utility
 * Sends HTTP POST to WebSocket server without blocking event processing
 */

const WEBSOCKET_API_URL = process.env.WEBSOCKET_API_URL || 'http://localhost:3001/api/notify';
const TIMEOUT_MS = 2000;

export interface NotificationData {
  eventType: string;
  gameId: bigint;
  data: any;
}

/**
 * Notify WebSocket server about a game event
 * Never throws - errors are logged but don't block processing
 */
export async function notifyWebSocket(
  eventType: string,
  gameId: bigint,
  data: any
): Promise<void> {
  // Don't block if WebSocket notifications are disabled
  if (process.env.DISABLE_WEBSOCKET === 'true') {
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(WEBSOCKET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        gameId: gameId.toString(),
        data,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      console.log(`✅ WebSocket notified: ${eventType} (game ${gameId})`);
    } else {
      console.warn(`⚠️ WebSocket notification failed: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    // Log but NEVER throw - don't block event processing
    if (error.name === 'AbortError') {
      console.warn(`⚠️ WebSocket notification timeout for ${eventType} (game ${gameId})`);
    } else {
      console.warn(`⚠️ WebSocket notification failed for ${eventType}:`, error.message);
    }
  }
}
