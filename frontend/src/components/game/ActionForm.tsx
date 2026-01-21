'use client';

import { memo } from 'react';
import { JoinGameForm } from '@/components/JoinGameForm';
import { VoteCommitForm } from '@/components/VoteCommitForm';
import { VoteRevealForm } from '@/components/VoteRevealForm';
import { ProcessRoundForm } from '@/components/ProcessRoundForm';
import type { Player, Commit, Vote, Elimination } from '@/lib/supabase';

interface ActionFormProps {
  gameId: number;
  gameState: string;
  currentRound: number;
  entryFee: string;
  userAddress?: string;
  players: Player[];
  commits: Commit[];
  votes: Vote[];
  eliminations: Elimination[];
}

export const ActionForm = memo(function ActionForm({
  gameId,
  gameState,
  currentRound,
  entryFee,
  userAddress,
  players,
  commits,
  votes,
  eliminations
}: ActionFormProps) {
  if (!userAddress) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center text-sm">
        Connect wallet to participate
      </div>
    );
  }

  const normalizedAddress = userAddress.toLowerCase();
  const hasJoined = players.some(p => p.player_address === normalizedAddress);
  const hasCommitted = commits.some(c => c.player_address === normalizedAddress);
  const hasRevealed = votes.some(v => v.player_address === normalizedAddress);
  const isEliminated = eliminations.some(
    e => e.player_address === normalizedAddress && e.eliminated
  );

  // Show elimination message if user is eliminated
  if (isEliminated && hasJoined) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-center">
        <p className="font-semibold text-red-400">✗ You were eliminated</p>
        <p className="text-sm text-muted-foreground mt-1">
          Better luck next time! You can watch the remaining rounds.
        </p>
      </div>
    );
  }

  // Show ONE form based on state and user status
  if (gameState === 'CommitPhase' && currentRound === 1 && !hasJoined) {
    return <JoinGameForm gameId={gameId} entryFee={entryFee} />;
  }

  if (gameState === 'CommitPhase' && hasJoined && !hasCommitted) {
    return <VoteCommitForm gameId={gameId} currentRound={currentRound} />;
  }

  if (gameState === 'CommitPhase' && hasCommitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-center">
        <p className="font-semibold text-green-400">✓ Vote committed</p>
        <p className="text-sm text-muted-foreground mt-1">
          Waiting for reveal phase...
        </p>
      </div>
    );
  }

  if (gameState === 'RevealPhase' && hasCommitted && !hasRevealed) {
    return (
      <div className="space-y-4">
        <VoteRevealForm gameId={gameId} currentRound={currentRound} />
        <ProcessRoundForm gameId={gameId} />
      </div>
    );
  }

  if (gameState === 'RevealPhase' && hasRevealed) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-center">
          <p className="font-semibold text-green-400">✓ Vote revealed</p>
          <p className="text-sm text-muted-foreground mt-1">
            Waiting for round to be processed...
          </p>
        </div>
        <ProcessRoundForm gameId={gameId} />
      </div>
    );
  }

  if (gameState === 'RevealPhase') {
    return <ProcessRoundForm gameId={gameId} />;
  }

  if (gameState === 'Completed') {
    return null; // No action form for completed games
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center text-sm">
      Waiting for next phase...
    </div>
  );
});
