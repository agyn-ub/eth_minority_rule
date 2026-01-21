'use client';

import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useGameDetailSimple } from '@/hooks/queries/use-game';
import { SimpleBanner } from '@/components/game/SimpleBanner';
import { ActionForm } from '@/components/game/ActionForm';
import { SimplePlayerList } from '@/components/game/SimplePlayerList';
import { GameResults } from '@/components/game/GameResults';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const params = useParams();
  const gameId = Number(params.id);
  const { address } = useAccount();

  const {
    game,
    currentRoundPlayers,
    currentRoundCommits,
    currentRoundVotes,
    currentRoundEliminations,
    isLoading
  } = useGameDetailSimple(gameId);

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-2 normal-case"
      >
        ← Back to Games
      </Button>

      {/* 1. Simple state banner */}
      <SimpleBanner
        gameId={gameId}
        gameState={game.state}
        deadline={(game.state === 'CommitPhase' ? game.commit_deadline : game.reveal_deadline) ?? null}
        questionText={game.question_text}
        currentRound={game.current_round}
      />

      {/* 2. ONE action form (conditionally rendered inside) */}
      <ActionForm
        gameId={gameId}
        gameState={game.state}
        currentRound={game.current_round}
        entryFee={game.entry_fee}
        userAddress={address}
        players={currentRoundPlayers}
        commits={currentRoundCommits}
        votes={currentRoundVotes}
        eliminations={currentRoundEliminations}
      />

      {/* 3. Simple player list */}
      {game.state !== 'Completed' && (
        <SimplePlayerList
          players={currentRoundPlayers}
          commits={currentRoundCommits}
          votes={currentRoundVotes}
          eliminations={currentRoundEliminations}
          gameState={game.state}
          currentUserAddress={address}
        />
      )}

      {/* 4. Results (only if complete) */}
      {game.state === 'Completed' && (
        <GameResults gameId={gameId} />
      )}
    </div>
  );
}
