export const WEBSOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  reconnect: {
    maxAttempts: 10,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
  heartbeat: {
    interval: 30000,
    timeout: 60000,
  },
};
