'use client';

import { useState } from 'react';
import { GameCard } from '@/components/GameCard';
import { useGameLists } from '@/hooks/queries/use-games';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const [showCompleted, setShowCompleted] = useState(false);

  // Replace manual polling with React Query
  const { activeGames, completedGames, isLoading } = useGameLists();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading games...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Minority Rule Games</h1>
          <p className="text-muted-foreground mt-2">
            Vote on yes/no questions. Only the minority advances to the next round!
          </p>
        </div>
        <Link href="/create">
          <Button size="lg">Create New Game</Button>
        </Link>
      </div>

      {activeGames.length === 0 && completedGames.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Games Yet</CardTitle>
            <CardDescription>Be the first to create a game!</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create">
              <Button>Create Game</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {activeGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Games ({activeGames.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {completedGames.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Completed Games ({completedGames.length})
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowCompleted(!showCompleted)}>
              {showCompleted ? 'Hide' : 'Show'}
            </Button>
          </div>

          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
