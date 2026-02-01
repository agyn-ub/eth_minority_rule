'use client';

import { useWebSocketConnection } from '@/hooks/websocket/use-websocket-connection';
import { ConnectionStatus } from '@/lib/websocket/types';

export function WebSocketStatus() {
  const { status } = useWebSocketConnection();

  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'bg-green-500';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'bg-yellow-500';
      case ConnectionStatus.ERROR:
        return 'bg-red-500';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'Connected';
      case ConnectionStatus.CONNECTING:
        return 'Connecting...';
      case ConnectionStatus.RECONNECTING:
        return 'Reconnecting...';
      case ConnectionStatus.ERROR:
        return 'Error';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      <span className="text-muted-foreground">{getStatusText()}</span>
    </div>
  );
}
