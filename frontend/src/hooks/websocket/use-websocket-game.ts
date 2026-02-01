'use client';

import { useEffect } from 'react';
import { getWebSocketClient } from '@/lib/websocket/client';
import { useGameMutations } from '../mutations/use-game-mutations';
import { useToast } from '@/hooks/use-toast';
import { GameEventType } from '@/lib/websocket/types';

export function useWebSocketGame(gameId: string | undefined) {
  const { invalidateGame } = useGameMutations();
  const { toast } = useToast();

  useEffect(() => {
    if (!gameId) return;

    const client = getWebSocketClient();

    // Subscribe to game room
    client.subscribe(gameId);

    // Event handlers
    const handlePlayerJoined = (data: any) => {
      console.log('WebSocket: Player joined', data);
      invalidateGame(gameId);
      toast({
        title: 'New player joined!',
        description: `Total players: ${data.totalPlayers}`,
      });
    };

    const handleVoteCommitted = (data: any) => {
      console.log('WebSocket: Vote committed', data);
      invalidateGame(gameId);
    };

    const handleVoteRevealed = (data: any) => {
      console.log('WebSocket: Vote revealed', data);
      invalidateGame(gameId);
      const voteText = data.vote ? 'YES' : 'NO';
      const shortAddress = data.playerAddress.slice(0, 6) + '...' + data.playerAddress.slice(-4);
      toast({
        title: 'Vote revealed!',
        description: `${shortAddress} voted ${voteText}`,
      });
    };

    const handleCommitPhaseStarted = (data: any) => {
      console.log('WebSocket: Commit phase started', data);
      invalidateGame(gameId);
      toast({
        title: 'Commit phase started!',
        description: `Round ${data.round} - Submit your votes`,
      });
    };

    const handleRevealPhaseStarted = (data: any) => {
      console.log('WebSocket: Reveal phase started', data);
      invalidateGame(gameId);
      toast({
        title: 'Reveal phase started!',
        description: `Round ${data.round} - Reveal your votes`,
      });
    };

    const handleRoundCompleted = (data: any) => {
      console.log('WebSocket: Round completed', data);
      invalidateGame(gameId);
      const minorityText = data.minorityVote ? 'YES' : 'NO';
      toast({
        title: 'Round completed!',
        description: `Minority: ${minorityText} | Remaining: ${data.votesRemaining}`,
      });
    };

    const handleGameCompleted = (data: any) => {
      console.log('WebSocket: Game completed', data);
      invalidateGame(gameId);
      toast({
        title: '🎉 Game completed!',
        description: `${data.winners.length} winner(s)`,
      });
    };

    // Register event handlers
    client.on('PlayerJoined' as GameEventType, handlePlayerJoined);
    client.on('VoteCommitted' as GameEventType, handleVoteCommitted);
    client.on('VoteRevealed' as GameEventType, handleVoteRevealed);
    client.on('CommitPhaseStarted' as GameEventType, handleCommitPhaseStarted);
    client.on('RevealPhaseStarted' as GameEventType, handleRevealPhaseStarted);
    client.on('RoundCompleted' as GameEventType, handleRoundCompleted);
    client.on('GameCompleted' as GameEventType, handleGameCompleted);

    // Cleanup
    return () => {
      client.off('PlayerJoined' as GameEventType, handlePlayerJoined);
      client.off('VoteCommitted' as GameEventType, handleVoteCommitted);
      client.off('VoteRevealed' as GameEventType, handleVoteRevealed);
      client.off('CommitPhaseStarted' as GameEventType, handleCommitPhaseStarted);
      client.off('RevealPhaseStarted' as GameEventType, handleRevealPhaseStarted);
      client.off('RoundCompleted' as GameEventType, handleRoundCompleted);
      client.off('GameCompleted' as GameEventType, handleGameCompleted);
      client.unsubscribe(gameId);
    };
  }, [gameId, invalidateGame, toast]);
}
