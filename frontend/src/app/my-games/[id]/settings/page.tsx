'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useGame } from '@/hooks/queries/use-game';
import { getGameCommitCount } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineDeadlineForm } from '@/components/InlineDeadlineForm';
import Link from 'next/link';
import { formatWei } from '@/lib/utils';
import { ArrowLeft, Clock, Check, Users, AlertCircle } from 'lucide-react';

export default function GameSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { address } = useAccount();
  const { data: game, isLoading } = useGame(params.id);

  // Fetch commit count
  const { data: commitCount, isLoading: isLoadingCommits } = useQuery({
    queryKey: ['commits-count', params.id],
    queryFn: () => getGameCommitCount(params.id),
    refetchInterval: 5000,
  });

  // Redirect if not the creator
  useEffect(() => {
    if (game && address && game.creator_address.toLowerCase() !== address.toLowerCase()) {
      router.push(`/game/${params.id}`);
    }
  }, [game, address, router, params.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading game settings...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!game) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Game not found</CardTitle>
            <CardDescription>The game you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/my-games">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to my games
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not the creator (will redirect via useEffect, but show message meanwhile)
  if (address && game.creator_address.toLowerCase() !== address.toLowerCase()) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>Only the game creator can access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You are not the creator of this game. Redirecting...
            </p>
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/my-games">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to my games
        </Button>
      </Link>

      {/* Page Header */}
      <div className="border-l-4 border-primary pl-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-primary"></div>
          <h1 className="text-xl font-bold">Game <span className="text-primary">settings</span></h1>
        </div>
        <p className="text-base text-muted-foreground">
          Configure deadlines and manage game phases
        </p>
      </div>

      {/* Game Info Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold">
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

          {/* Current Deadlines */}
          {(game.commit_deadline || game.reveal_deadline) && (
            <div className="p-4 bg-muted/20 rounded-md space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="w-4 h-4" />
                <span>Current deadlines</span>
              </div>

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
        </CardContent>
      </Card>

      {/* Commit Status */}
      {game.state === 'CommitPhase' && (
        <Card className={commitCount === 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5'}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <CardTitle className="text-base">Commit status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Commits received:</span>
              <span className={`text-lg font-bold ${commitCount === 0 ? 'text-amber-500' : 'text-success'}`}>
                {isLoadingCommits ? '...' : commitCount}
              </span>
            </div>

            {commitCount === 0 && (
              <>
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-amber-500">At least one commit required</p>
                    <p className="text-muted-foreground">
                      You cannot set the reveal deadline until at least one player has committed their vote.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">What you can do:</p>
                  <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>Wait for other players to join and commit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>Join the game yourself and commit a vote (creators can participate!)</span>
                    </li>
                  </ul>

                  <Link href={`/game/${game.game_id}`}>
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Go to game to join & commit
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {commitCount > 0 && (
              <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded-md">
                <Check className="w-4 h-4 text-success mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {commitCount} {commitCount === 1 ? 'player has' : 'players have'} committed. You can now set the reveal deadline once the commit deadline has passed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deadline Management */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-accent"></div>
          <h2 className="text-lg font-bold">Deadline management</h2>
        </div>

        {/* Warning if trying to set reveal but no commits yet */}
        {game.state === 'CommitPhase' &&
          game.commit_deadline &&
          Date.now() > Number(game.commit_deadline) * 1000 &&
          !game.reveal_deadline &&
          commitCount === 0 && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <div>
                  <h4 className="font-bold text-amber-500">No Commits Received</h4>
                  <p className="text-sm text-muted-foreground">
                    No players committed votes. You can still set a reveal deadline, but there will be no votes to reveal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <InlineDeadlineForm game={game} />

        {/* Info Card */}
        {!game.commit_deadline && game.state === 'ZeroPhase' && (
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Set the commit deadline to start the game. Players will be able to join and commit their votes during this period.
              </p>
            </CardContent>
          </Card>
        )}

        {game.state === 'CommitPhase' && !game.reveal_deadline && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {game.commit_deadline && Date.now() > Number(game.commit_deadline) * 1000
                  ? commitCount === 0
                    ? 'The commit deadline has passed, but no players have committed yet. At least one commit is required before you can set the reveal deadline.'
                    : 'The commit deadline has passed. Set the reveal deadline to allow players to reveal their votes.'
                  : 'Wait for the commit deadline to pass before setting the reveal deadline.'}
              </p>
            </CardContent>
          </Card>
        )}

        {(game.state === 'RevealPhase' || game.state === 'Completed') && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                All deadlines have been set. The game is now {game.state === 'RevealPhase' ? 'in the reveal phase' : 'completed'}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`/game/${game.game_id}`}>
            <Button variant="outline" className="w-full">
              View game details
            </Button>
          </Link>
          <Link href="/my-games">
            <Button variant="outline" className="w-full">
              Back to my games
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
