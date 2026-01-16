'use client';

import { useState } from 'react';
import { GameCard } from '@/components/GameCard';
import { useGameLists } from '@/hooks/queries/use-games';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateGameModal } from '@/components/CreateGameModal';

export default function Home() {
  const [showCompleted, setShowCompleted] = useState(false);

  // Replace manual polling with React Query
  const { activeGames, completedGames, isLoading } = useGameLists();

  // Filter out ZeroPhase games - creators use /my-games to view them
  const visibleActiveGames = activeGames.filter(game => game.state !== 'ZeroPhase');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading games...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - Liar Game Style */}
      <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-accent to-primary"></div>
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary"></div>
              <h1 className="text-xl font-bold tracking-tight">
                Active <span className="text-primary">Games</span>
              </h1>
            </div>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Choose wisely. <span className="text-accent font-bold">Vote strategically.</span>{' '}
              Only the <span className="text-primary font-bold">minority</span> survives each round.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-accent"></div>
                <span className="text-muted-foreground">High Stakes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary"></div>
                <span className="text-muted-foreground">Trust No One</span>
              </div>
            </div>
          </div>
          <CreateGameModal
            trigger={
              <Button size="lg" variant="gradient" className="h-14 px-10 text-base">
                ⚡ Create New Game
              </Button>
            }
          />
        </div>
      </div>

      {visibleActiveGames.length === 0 && completedGames.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Games Yet</CardTitle>
            <CardDescription>Be the first to create a game!</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateGameModal trigger={<Button>Create Game</Button>} />
          </CardContent>
        </Card>
      )}

      {visibleActiveGames.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
            <div className="w-2 h-2 bg-primary"></div>
            <h2 className="text-lg font-bold tracking-normal">
              Active Games <span className="text-primary">({visibleActiveGames.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleActiveGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {completedGames.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 border-l-4 border-muted pl-4">
              <div className="w-2 h-2 bg-muted-foreground"></div>
              <h2 className="text-lg font-bold tracking-normal text-muted-foreground">
                Completed Games ({completedGames.length})
              </h2>
            </div>
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
