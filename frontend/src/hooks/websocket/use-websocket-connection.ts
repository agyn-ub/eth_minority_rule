'use client';

import { useEffect, useState } from 'react';
import { getWebSocketClient } from '@/lib/websocket/client';
import { ConnectionStatus } from '@/lib/websocket/types';

export function useWebSocketConnection() {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  useEffect(() => {
    const client = getWebSocketClient();

    // Set initial status
    setStatus(client.getStatus());

    // Listen for status changes
    client.onStatusChange(setStatus);

    // Connect on mount
    client.connect();

    // Cleanup: disconnect on unmount
    return () => {
      client.offStatusChange(setStatus);
      // Don't disconnect here - let other components use the connection
      // Only disconnect when the entire app unmounts
    };
  }, []);

  return {
    connected: status === ConnectionStatus.CONNECTED,
    reconnecting: status === ConnectionStatus.RECONNECTING,
    status,
  };
}
