'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayerGameCard } from '@/components/PlayerGameCard';
import { usePlayerStats } from '@/hooks/queries/use-player-stats';
import { useBatchPlayerGameDetails } from '@/hooks/queries/use-batch-player-game-details';
import { formatAddress, formatWei } from '@/lib/utils';

export default function PlayerStatsPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const { data: stats, isLoading: statsLoading } = usePlayerStats(address);

  // Extract game IDs
  const gameIds = stats?.games_participated.map(g => g.game_id) || [];

  // Batch fetch all game details at once
  const { data: gameDetails, isLoading: detailsLoading } = useBatchPlayerGameDetails(
    address,
    gameIds
  );

  const isLoading = statsLoading || detailsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading player statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/players">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </Link>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              This player hasn&apos;t participated in any games yet.
            </p>
            <Link href="/players">
              <Button variant="outline">Search Another Player</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/players">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>
      </Link>

      {/* Player Stats Header */}
      <Card className="border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader>
          <CardTitle>Player Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Address */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Wallet Address</div>
            <div className="font-mono text-lg font-bold">
              {formatAddress(stats.player_address)}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {stats.player_address}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Games</div>
              <div className="text-2xl font-bold">{stats.total_games}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Wins</div>
              <div className="text-2xl font-bold text-green-500">
                {stats.total_wins}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-accent">
                {stats.win_rate.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Prizes</div>
              <div className="text-2xl font-bold text-green-500">
                {formatWei(stats.total_prize_amount)} ETH
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary"></div>
          <h2 className="text-xl font-bold">
            Game History <span className="text-muted-foreground">({stats.total_games})</span>
          </h2>
        </div>

        {!gameDetails || gameDetails.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No games found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gameDetails.map((detail) => (
              <PlayerGameCard
                key={detail.game_id}
                gameDetail={detail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
