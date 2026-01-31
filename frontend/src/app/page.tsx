'use client';

import { useState } from 'react';
import { GameCard } from '@/components/GameCard';
import { useGameLists } from '@/hooks/queries/use-games';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateGameModal } from '@/components/CreateGameModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { GameCardSkeletonGrid } from '@/components/GameCardSkeleton';

export default function Home() {
  // Tab and pagination state
  const [activeTab, setActiveTab] = useState('ongoing');

  // Separate page state for each tab
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);

  // Fetch paginated data with server-side pagination
  const {
    activeGames,
    completedGames,
    activeGamesTotal,
    activeGamesTotalPages,
    completedGamesTotal,
    completedGamesTotalPages,
    isLoading,
    isLoadingActive,
    isLoadingCompleted,
  } = useGameLists(activePage, completedPage);

  // Filter ongoing and new games (client-side filtering on small dataset)
  // TEMPORARILY SHOWING ALL GAMES FOR DEBUGGING
  const ongoingGames = activeGames.filter(
    (game) => game.current_round > 1 // Show all ongoing games regardless of state
  );

  const newGames = activeGames.filter(
    (game) => game.current_round === 1 // Show all new games regardless of state
  );

  // Calculate totals for each category
  const ongoingCount = ongoingGames.length;
  const newCount = newGames.length;

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
      {ongoingCount === 0 && newCount === 0 && completedGamesTotal === 0 && (
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
      {(ongoingCount > 0 || newCount > 0 || completedGamesTotal > 0) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto">
            <TabsTrigger value="ongoing" className="flex-1">
              Ongoing <span className="font-bold ml-1">({ongoingCount})</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1">
              New <span className="font-bold ml-1">({newCount})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed <span className="font-bold ml-1">({completedGamesTotal})</span>
            </TabsTrigger>
          </TabsList>

          {/* Ongoing Games Tab */}
          <TabsContent value="ongoing">
            {isLoadingActive && ongoingGames.length === 0 ? (
              // Show skeletons on first load (no cached data)
              <GameCardSkeletonGrid count={6} />
            ) : ongoingGames.length === 0 ? (
              // Empty state (after data loads)
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No games in progress. New games appear here once they reach the commit phase.
                  </p>
                </CardContent>
              </Card>
            ) : (
              // Show actual game cards
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingGames.map((game) => (
                    <GameCard key={game.game_id} game={game} />
                  ))}
                </div>
                {activeGamesTotalPages > 1 && (
                  <Pagination
                    currentPage={activePage}
                    totalPages={activeGamesTotalPages}
                    onPageChange={setActivePage}
                    totalItems={activeGamesTotal}
                    itemsPerPage={20}
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* New Games Tab */}
          <TabsContent value="new">
            {isLoadingActive && newGames.length === 0 ? (
              <GameCardSkeletonGrid count={6} />
            ) : newGames.length === 0 ? (
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
                  {newGames.map((game) => (
                    <GameCard key={game.game_id} game={game} />
                  ))}
                </div>
                {activeGamesTotalPages > 1 && (
                  <Pagination
                    currentPage={activePage}
                    totalPages={activeGamesTotalPages}
                    onPageChange={setActivePage}
                    totalItems={activeGamesTotal}
                    itemsPerPage={20}
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* Completed Games Tab */}
          <TabsContent value="completed">
            {isLoadingCompleted && completedGames.length === 0 ? (
              <GameCardSkeletonGrid count={6} />
            ) : completedGames.length === 0 ? (
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
                  {completedGames.map((game) => (
                    <GameCard key={game.game_id} game={game} />
                  ))}
                </div>
                {completedGamesTotalPages > 1 && (
                  <Pagination
                    currentPage={completedPage}
                    totalPages={completedGamesTotalPages}
                    onPageChange={setCompletedPage}
                    totalItems={completedGamesTotal}
                    itemsPerPage={20}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
