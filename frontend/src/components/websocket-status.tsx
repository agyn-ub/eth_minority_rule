'use client';

import { useWebSocketConnection } from '@/hooks/websocket/use-websocket-connection';
import { ConnectionStatus } from '@/lib/websocket/types';

export function WebSocketStatus() {
  const { status } = useWebSocketConnection();

  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'bg-accent';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'bg-amber-500';
      case ConnectionStatus.ERROR:
        return 'bg-primary';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'bg-muted-foreground';
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
