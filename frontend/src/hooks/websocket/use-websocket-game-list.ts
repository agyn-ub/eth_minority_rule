'use client';

import { useEffect } from 'react';
import { getWebSocketClient } from '@/lib/websocket/client';
import { useGameMutations } from '../mutations/use-game-mutations';
import { GameEventType } from '@/lib/websocket/types';

export function useWebSocketGameList(listType: 'active' | 'completed') {
  const { invalidateGameLists } = useGameMutations();

  useEffect(() => {
    const client = getWebSocketClient();

    // Subscribe to list room
    client.subscribeToList(listType);

    // Event handler
    const handleEvent = (data: any) => {
      console.log(`WebSocket: Game list event (${listType})`, data);
      invalidateGameLists();
    };

    // Register event handler for all events affecting this list
    client.on('connection' as any, handleEvent);

    // Cleanup
    return () => {
      client.off('connection' as any, handleEvent);
      client.unsubscribeFromList(listType);
    };
  }, [listType, invalidateGameLists]);
}
