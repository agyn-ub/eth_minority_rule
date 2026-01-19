'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useGameDetail } from '@/hooks/queries/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VoteCommitForm } from '@/components/VoteCommitForm';
import { VoteRevealForm } from '@/components/VoteRevealForm';
import { JoinGameForm } from '@/components/JoinGameForm';
import { TimerProgress } from '@/components/TimerProgress';
import { ProcessRoundForm } from '@/components/ProcessRoundForm';
import { PlayerStatusCard } from '@/components/PlayerStatusCard';
import { formatWei, formatAddress, getGameStateLabel, getTimeRemaining } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = Number(params.id);
  const { address } = useAccount();
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

  // Replace manual polling with React Query
  const {
    game,
    players,
    votes,
    commits,
    rounds,
    winners,
    isLoading,
  } = useGameDetail(gameId);

  // Check if current user is the game creator
  const isCreator = address && game?.creator_address
    ? address.toLowerCase() === game.creator_address.toLowerCase()
    : false;

  // Update current time for form visibility checks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    // Sync time when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setCurrentTime(Math.floor(Date.now() / 1000));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  const hasJoined = address && players.some((p) => p.player_address === address.toLowerCase());
  const hasCommitted = address && commits.some(
    (c) => c.player_address === address.toLowerCase() && c.round === game.current_round
  );
  const hasRevealed = address && votes.some(
    (v) => v.player_address === address.toLowerCase() && v.round === game.current_round
  );

  // Get the user's committed vote from localStorage
  const getStoredCommit = (): { vote: boolean; salt: string } | null => {
    if (!address) return null;
    try {
      const key = `minority_rule_vote_${gameId}_${game.current_round}_${address.toLowerCase()}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };
  const storedCommit = hasCommitted ? getStoredCommit() : null;

  const currentRoundVotes = votes.filter((v) => v.round === game.current_round);

  // Helper function to get state background color
  const getStateBgColor = (state: string): string => {
    switch (state) {
      case 'ZeroPhase':
        return 'bg-state-waiting';
      case 'CommitPhase':
        return 'bg-state-commit';
      case 'RevealPhase':
        return 'bg-state-reveal';
      case 'Completed':
        return 'bg-state-completed';
      default:
        return 'bg-state-waiting';
    }
  };

  const stateBgColor = getStateBgColor(game.state);
  const stateLabel = getGameStateLabel(game.state);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-2 normal-case"
      >
        ← Back to Games
      </Button>

      {/* State Header Bar - Dramatic */}
      <Card className="overflow-hidden border-primary/30 bg-card">
        <div className={`${stateBgColor} px-6 py-5 flex items-center justify-between relative`}>
          <div className="absolute left-0 top-0 w-2 h-full bg-white/40"></div>
          <div className="absolute right-0 top-0 w-2 h-full bg-white/20"></div>
          <div className="flex items-center gap-4">
            <span className="text-base font-bold text-white uppercase tracking-wide">
              {stateLabel}
            </span>
            {isCreator && (
              <span className="px-4 py-1.5 text-xs bg-black/40 text-white rounded border border-white/30 font-bold uppercase tracking-wider">
                Creator
              </span>
            )}
          </div>
          {((game.state === 'CommitPhase' && game.commit_deadline) ||
            (game.state === 'RevealPhase' && game.reveal_deadline)) && (
            <div className="flex-1 max-w-xs">
              <TimerProgress
                deadline={
                  game.state === 'CommitPhase'
                    ? Number(game.commit_deadline)
                    : Number(game.reveal_deadline)
                }
                label={`${stateLabel} ends`}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Question Display */}
        <div className="px-8 py-8 border-l-4 border-primary/50">
          <h1 className="text-xl font-bold text-foreground mb-4 leading-tight">
            {game.question_text || `Game #${game.game_id}`}
          </h1>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono text-muted-foreground">
              Game #{game.game_id}
            </span>
            <div className="w-1 h-1 bg-primary"></div>
            <span className="font-semibold text-primary">
              Round {game.current_round}
            </span>
          </div>
        </div>
      </Card>

      {/* Stats Dashboard - Dramatic Liar Game Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prize Pool */}
        <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/30 border-l-4 border-l-accent overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <CardTitle className="text-sm font-bold tracking-normal">Prize Pool</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent mb-2">{formatWei(game.prize_pool)} ETH</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent"></div>
              <p className="text-xs text-muted-foreground font-mono tracking-normal">
                Entry: {formatWei(game.entry_fee)} ETH
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/30 border-l-4 border-l-primary overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👥</div>
              <CardTitle className="text-sm font-bold tracking-normal">Players</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground mb-2">{game.total_players}</p>
            {hasJoined ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-success"></div>
                <p className="text-xs text-success font-bold tracking-normal">✓ You're in</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-muted-foreground"></div>
                <p className="text-xs text-muted-foreground font-mono tracking-normal">Not joined</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Remaining */}
        <Card className="bg-gradient-to-br from-card to-card border-border/50 border-l-4 border-l-muted overflow-hidden relative">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⏱</div>
              <CardTitle className="text-sm font-bold tracking-normal">Time Left</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {game.state === 'CommitPhase' && game.commit_deadline && (
              <TimerProgress
                deadline={Number(game.commit_deadline)}
                label="Commit phase ends"
                size="lg"
              />
            )}
            {game.state === 'RevealPhase' && game.reveal_deadline && (
              <TimerProgress
                deadline={Number(game.reveal_deadline)}
                label="Reveal phase ends"
                size="lg"
              />
            )}
            {(game.state === 'ZeroPhase' || game.state === 'Completed') && (
              <div>
                <p className="text-2xl font-bold tabular-nums text-foreground mb-2">
                  No deadline
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground"></div>
                  <p className="text-xs text-muted-foreground font-mono tracking-normal">{stateLabel}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Creator Action Button */}
      {isCreator && game.state !== 'Completed' && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">You are the game creator</p>
                <p className="text-sm text-muted-foreground">
                  Manage game deadlines and phases
                </p>
              </div>
              <Link href={`/my-games/${gameId}/settings`}>
                <Button variant="default">
                  <Settings className="w-4 h-4 mr-2" />
                  Game Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasJoined && game.state === 'CommitPhase' && game.current_round === 1 &&
        game.commit_deadline && currentTime < Number(game.commit_deadline) && (
        <JoinGameForm gameId={gameId} entryFee={game.entry_fee} />
      )}

      {game.state === 'CommitPhase' && hasJoined && !hasCommitted &&
        game.commit_deadline && currentTime < Number(game.commit_deadline) && (
        <VoteCommitForm gameId={gameId} currentRound={game.current_round} />
      )}

      {game.state === 'CommitPhase' && hasJoined && hasCommitted &&
        game.commit_deadline && currentTime < Number(game.commit_deadline) && (
        <Card className="border-success/50 bg-success/10">
          <CardHeader>
            <CardTitle className="text-success">✅ Vote Committed</CardTitle>
            <CardDescription>
              Your vote is encrypted and recorded on-chain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storedCommit && (
              <div className="p-4 bg-background/50 rounded-lg border border-success/20">
                <p className="text-xs text-muted-foreground mb-2">Your committed vote</p>
                <p className={`text-2xl font-bold ${storedCommit.vote ? 'text-success' : 'text-primary'}`}>
                  {storedCommit.vote ? 'YES' : 'NO'}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ✓ Your vote is encrypted and stored on the blockchain
              </p>
              <p className="text-sm text-muted-foreground">
                ✓ You'll reveal it during the reveal phase
              </p>
              <p className="text-sm font-semibold text-accent">
                Keep your secret salt safe - you'll need it to reveal!
              </p>
            </div>

            <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
              <p className="text-xs text-muted-foreground">
                Waiting for commit phase to end...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting for Reveal Phase - Show After Commit Deadline */}
      {game.state === 'CommitPhase' && hasJoined && hasCommitted &&
        game.commit_deadline && currentTime >= Number(game.commit_deadline) &&
        !game.reveal_deadline && (
        <Card className="border-accent/50 bg-accent/10">
          <CardHeader>
            <CardTitle className="text-accent">⏳ Commit Phase Ended</CardTitle>
            <CardDescription>
              Waiting for game creator to start reveal phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The commit deadline has passed. The game creator will set the reveal deadline to continue.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Missed Commit Phase - User Joined but Didn't Vote */}
      {game.state === 'RevealPhase' && hasJoined && !hasCommitted && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">❌ Missed Commit Phase</CardTitle>
            <CardDescription>
              You didn't commit a vote during the commit phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Unfortunately, you cannot participate in this round since you didn't commit a vote before the deadline.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Process Round - Show When Reveal Deadline Passed */}
      {game.state === 'RevealPhase' && game.reveal_deadline &&
        currentTime >= Number(game.reveal_deadline) && (
        <ProcessRoundForm gameId={gameId} />
      )}

      {game.state === 'RevealPhase' && hasJoined && hasCommitted && !hasRevealed &&
        game.reveal_deadline && currentTime < Number(game.reveal_deadline) && (
        <VoteRevealForm gameId={gameId} currentRound={game.current_round} />
      )}

      <PlayerStatusCard
        gameId={gameId}
        currentRound={game.current_round}
        gameState={game.state}
        players={players}
        commits={commits}
        votes={votes}
        currentUserAddress={address}
      />

      {currentRoundVotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Round Votes ({currentRoundVotes.length})</CardTitle>
            <CardDescription>Revealed votes for round {game.current_round}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentRoundVotes.map((vote) => (
                <div key={vote.id} className="flex items-center justify-between py-2 border-b">
                  <Link
                    href={`/player/${vote.player_address}`}
                    className="font-mono text-sm hover:text-primary transition-colors underline decoration-dotted"
                  >
                    {vote.player_address}
                  </Link>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      vote.vote ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {vote.vote ? 'YES' : 'NO'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Round History</CardTitle>
            <CardDescription>Results from completed rounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rounds.map((round) => (
                <div key={round.id} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Round {round.round}</h4>
                  <p className="text-sm text-muted-foreground">
                    YES: {round.yes_count} • NO: {round.no_count}
                  </p>
                  <p className="text-sm font-medium">
                    Minority: {round.minority_vote ? 'YES' : 'NO'} • Remaining:{' '}
                    {round.remaining_players}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {winners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Winners</CardTitle>
            <CardDescription>Congratulations!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {winners.map((winner) => (
                <div key={winner.id} className="flex items-center justify-between py-2 border-b">
                  <Link
                    href={`/player/${winner.player_address}`}
                    className="font-mono text-sm hover:text-primary transition-colors underline decoration-dotted"
                  >
                    {winner.player_address}
                  </Link>
                  <span className="text-sm font-semibold text-green-600">
                    {formatWei(winner.prize_amount)} ETH
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
