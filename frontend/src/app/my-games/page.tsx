'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useMyGames } from '@/hooks/queries/use-my-games';
import { useWebSocketGameList } from '@/hooks/websocket/use-websocket-game-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateGameModal } from '@/components/CreateGameModal';
import Link from 'next/link';
import { formatWei } from '@/lib/utils';
import { Search, Settings } from 'lucide-react';

export default function MyGamesPage() {
  const { address } = useAccount();
  const { data: games, isLoading } = useMyGames();
  const [searchQuery, setSearchQuery] = useState('');

  // Enable real-time updates via WebSocket
  useWebSocketGameList('active');
  useWebSocketGameList('completed');

  // Filter games by search query
  const filteredGames = games?.filter(game => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchesId = game.game_id.toString().includes(query);
    const matchesQuestion = game.question_text?.toLowerCase().includes(query);

    return matchesId || matchesQuestion;
  }) || [];

  // Group filtered games by state
  const activeGames = filteredGames.filter(g =>
    ['ZeroPhase', 'CommitPhase', 'RevealPhase'].includes(g.state)
  );

  const completedGames = filteredGames.filter(g => g.state === 'Completed');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading your games...</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!address) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Connect your wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view your games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the "Connect MetaMask" button in the header to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (games?.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No games created yet</CardTitle>
            <CardDescription>
              Create your first game to get started!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You haven't created any games yet. Create a new Minority Rule game and become the game master!
            </p>
            <CreateGameModal
              trigger={<Button size="lg" className="w-full">⚡ Create your first game</Button>}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get state badge
  const getStateBadge = (state: string) => {
    const badgeClasses = {
      ZeroPhase: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      CommitPhase: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      RevealPhase: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      Completed: 'bg-success/10 text-success border-success/30',
    }[state] || 'bg-muted text-muted-foreground border-muted';

    const label = {
      ZeroPhase: 'Setup Phase',
      CommitPhase: 'Commit Phase',
      RevealPhase: 'Reveal Phase',
      Completed: 'Completed',
    }[state] || state;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${badgeClasses}`}>
        {label}
      </span>
    );
  };

  // Game list with search
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-l-4 border-primary pl-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-primary"></div>
          <h1 className="text-xl font-bold">My <span className="text-primary">games</span></h1>
        </div>
        <p className="text-base text-muted-foreground">
          {games?.length || 0} total · {activeGames.length} active · {completedGames.length} completed
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by game ID or question..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* No Results */}
      {searchQuery && filteredGames.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No games found matching "{searchQuery}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Games */}
      {activeGames.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent"></div>
            <h2 className="text-lg font-bold">Active games</h2>
          </div>

          <div className="space-y-4">
            {activeGames.map(game => (
              <Card key={game.game_id} className="border-primary/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">
                        {game.question_text || `Game #${game.game_id}`}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Game #{game.game_id} · Round {game.current_round}
                      </CardDescription>
                    </div>
                    {getStateBadge(game.state)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Game Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Players</p>
                      <p className="text-base font-bold">{game.total_players}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Prize pool</p>
                      <p className="text-base font-bold text-accent">
                        {formatWei(game.prize_pool)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Entry fee</p>
                      <p className="text-base font-bold">
                        {formatWei(game.entry_fee)} ETH
                      </p>
                    </div>
                  </div>

                  {/* Deadlines Info */}
                  {(game.commit_deadline || game.reveal_deadline) && (
                    <div className="p-4 bg-muted/20 rounded-md space-y-2">
                      {game.commit_deadline && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Commit deadline:</span>
                          <span className="font-semibold">
                            {new Date(Number(game.commit_deadline) * 1000).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {game.reveal_deadline && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reveal deadline:</span>
                          <span className="font-semibold">
                            {new Date(Number(game.reveal_deadline) * 1000).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/game/${game.game_id}`}>
                      <Button variant="outline" className="w-full">
                        View details
                      </Button>
                    </Link>
                    <Link href={`/my-games/${game.game_id}/settings`}>
                      <Button variant="default" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Games */}
      {completedGames.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-muted-foreground"></div>
            <h2 className="text-lg font-bold text-muted-foreground">Completed games</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGames.map(game => (
              <Card key={game.game_id} className="border-muted">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold truncate">
                        {game.question_text || `Game #${game.game_id}`}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Game #{game.game_id}
                      </CardDescription>
                    </div>
                    {getStateBadge(game.state)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-muted-foreground">Prize pool</span>
                    <span className="text-sm font-bold text-success">
                      {formatWei(game.prize_pool)} ETH
                    </span>
                  </div>

                  <Link href={`/game/${game.game_id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      View results
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
