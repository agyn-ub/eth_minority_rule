'use client';

import { useState } from 'react';
import { GameCard } from '@/components/GameCard';
import { useGameLists } from '@/hooks/queries/use-games';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateGameModal } from '@/components/CreateGameModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';

const GAMES_PER_PAGE = 9;

export default function Home() {
  // Tab and pagination state
  const [activeTab, setActiveTab] = useState('ongoing');
  const [ongoingPage, setOngoingPage] = useState(1);
  const [newPage, setNewPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);

  // Replace manual polling with React Query
  const { activeGames, completedGames, isLoading } = useGameLists();

  // Filter games into categories
  // Ongoing: active voting phases (CommitPhase or RevealPhase)
  const ongoingGames = activeGames.filter(
    (game) => game.state === 'CommitPhase' || game.state === 'RevealPhase'
  );

  // New: round 1 games (not ZeroPhase, not Completed)
  const newGames = activeGames.filter(
    (game) =>
      game.current_round === 1 &&
      game.state !== 'Completed' &&
      game.state !== 'ZeroPhase'
  );

  // Pagination helper
  const paginateGames = (games: typeof activeGames, currentPage: number) => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    const endIndex = startIndex + GAMES_PER_PAGE;
    return games.slice(startIndex, endIndex);
  };

  // Paginated game lists
  const paginatedOngoingGames = paginateGames(ongoingGames, ongoingPage);
  const paginatedNewGames = paginateGames(newGames, newPage);
  const paginatedCompletedGames = paginateGames(completedGames, completedPage);

  // Calculate total pages
  const ongoingTotalPages = Math.ceil(ongoingGames.length / GAMES_PER_PAGE);
  const newTotalPages = Math.ceil(newGames.length / GAMES_PER_PAGE);
  const completedTotalPages = Math.ceil(completedGames.length / GAMES_PER_PAGE);

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

      {/* Empty state when no games exist */}
      {ongoingGames.length === 0 && newGames.length === 0 && completedGames.length === 0 && (
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

      {/* Tabs with game categories */}
      {(ongoingGames.length > 0 || newGames.length > 0 || completedGames.length > 0) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto">
            <TabsTrigger value="ongoing" className="flex-1">
              Ongoing <span className="font-bold ml-1">({ongoingGames.length})</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1">
              New <span className="font-bold ml-1">({newGames.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed <span className="font-bold ml-1">({completedGames.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Ongoing Games Tab */}
          <TabsContent value="ongoing">
            {paginatedOngoingGames.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No games in progress. New games appear here once they reach the commit phase.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedOngoingGames.map((game) => (
                    <GameCard key={game.game_id} game={game} />
                  ))}
                </div>
                <Pagination
                  currentPage={ongoingPage}
                  totalPages={ongoingTotalPages}
                  onPageChange={setOngoingPage}
                  totalItems={ongoingGames.length}
                  itemsPerPage={GAMES_PER_PAGE}
                />
              </>
            )}
          </TabsContent>

          {/* New Games Tab */}
          <TabsContent value="new">
            {paginatedNewGames.length === 0 ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-center text-muted-foreground">
                    No new games available. Be the first to create one!
                  </p>
                  <div className="flex justify-center">
                    <CreateGameModal trigger={<Button>Create Game</Button>} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedNewGames.map((game) => (
                    <GameCard key={game.game_id} game={game} />
                  ))}
                </div>
                <Pagination
                  currentPage={newPage}
                  totalPages={newTotalPages}
                  onPageChange={setNewPage}
                  totalItems={newGames.length}
                  itemsPerPage={GAMES_PER_PAGE}
                />
              </>
            )}
          </TabsContent>

          {/* Completed Games Tab */}
          <TabsContent value="completed">
            {paginatedCompletedGames.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No completed games yet. Check back soon!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedCompletedGames.map((game) => (
                    <GameCard key={game.game_id} game={game} />
                  ))}
                </div>
                <Pagination
                  currentPage={completedPage}
                  totalPages={completedTotalPages}
                  onPageChange={setCompletedPage}
                  totalItems={completedGames.length}
                  itemsPerPage={GAMES_PER_PAGE}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
