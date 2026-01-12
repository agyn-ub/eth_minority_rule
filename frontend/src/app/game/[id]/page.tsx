'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useGameDetail } from '@/hooks/queries/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VoteCommitForm } from '@/components/VoteCommitForm';
import { VoteRevealForm } from '@/components/VoteRevealForm';
import { JoinGameForm } from '@/components/JoinGameForm';
import { GameConfigForm } from '@/components/GameConfigForm';
import { formatWei, formatAddress, getGameStateLabel, getTimeRemaining } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const params = useParams();
  const gameId = Number(params.id);
  const { address } = useAccount();
  const [timeLeft, setTimeLeft] = useState<string>('');
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
  const isCreator = address && game?.creatorAddress
    ? address.toLowerCase() === game.creatorAddress.toLowerCase()
    : false;

  // Timer updates (client-side only, doesn't require data fetching)
  useEffect(() => {
    if (!game) return;

    const updateTimer = () => {
      // Update current time
      setCurrentTime(Math.floor(Date.now() / 1000));

      // Update time remaining displays
      if (game.state === 'CommitPhase' && game.commitDeadline) {
        setTimeLeft(getTimeRemaining(Number(game.commitDeadline)));
      } else if (game.state === 'RevealPhase' && game.revealDeadline) {
        setTimeLeft(getTimeRemaining(Number(game.revealDeadline)));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [game]);

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  const hasJoined = address && players.some((p) => p.playerAddress === address.toLowerCase());
  const hasCommitted = address && commits.some(
    (c) => c.playerAddress === address.toLowerCase() && c.round === game.currentRound
  );
  const hasRevealed = address && votes.some(
    (v) => v.playerAddress === address.toLowerCase() && v.round === game.currentRound
  );

  const currentRoundVotes = votes.filter((v) => v.round === game.currentRound);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{game.questionText}</h1>
        <p className="text-muted-foreground mt-2">
          Game #{game.id} • Round {game.currentRound} • {getGameStateLabel(game.state)}
          {isCreator && <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">Creator</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prize Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatWei(game.prizePool)} ETH</p>
            <p className="text-sm text-muted-foreground mt-1">
              Entry Fee: {formatWei(game.entryFee)} ETH
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{game.totalPlayers}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasJoined ? 'You are playing' : 'Not joined'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{timeLeft || 'N/A'}</p>
            <p className="text-sm text-muted-foreground mt-1">{getGameStateLabel(game.state)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Creator configuration - only shown to game creator */}
      {isCreator && game.state === 'ZeroPhase' && (
        <GameConfigForm gameId={gameId} currentState={game.state} />
      )}

      {isCreator && game.state === 'CommitPhase' && game.commitDeadline &&
        currentTime >= Number(game.commitDeadline) && (
        <GameConfigForm gameId={gameId} currentState={game.state} />
      )}

      {isCreator && game.state === 'CommitPhase' && game.commitDeadline &&
        currentTime < Number(game.commitDeadline) && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>Waiting for Commit Phase to End</CardTitle>
            <CardDescription>
              The reveal deadline can be set after the commit deadline passes and at least one player has committed.
              <br />
              <strong>Time remaining: {timeLeft}</strong>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!hasJoined && game.state === 'CommitPhase' && game.currentRound === 1 &&
        game.commitDeadline && currentTime < Number(game.commitDeadline) && (
        <JoinGameForm gameId={gameId} entryFee={game.entryFee} />
      )}

      {game.state === 'CommitPhase' && hasJoined && !hasCommitted &&
        game.commitDeadline && currentTime < Number(game.commitDeadline) && (
        <VoteCommitForm gameId={gameId} currentRound={game.currentRound} />
      )}

      {game.state === 'RevealPhase' && hasJoined && hasCommitted && !hasRevealed &&
        game.revealDeadline && currentTime < Number(game.revealDeadline) && (
        <VoteRevealForm gameId={gameId} currentRound={game.currentRound} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Players ({players.length})</CardTitle>
          <CardDescription>All participants in this game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between py-2 border-b">
                <span className="font-mono text-sm">{formatAddress(player.playerAddress)}</span>
                <span className="text-sm text-muted-foreground">
                  {formatWei(player.joinedAmount)} ETH
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentRoundVotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Round Votes ({currentRoundVotes.length})</CardTitle>
            <CardDescription>Revealed votes for round {game.currentRound}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentRoundVotes.map((vote) => (
                <div key={vote.id} className="flex items-center justify-between py-2 border-b">
                  <span className="font-mono text-sm">{formatAddress(vote.playerAddress)}</span>
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
                    YES: {round.yesCount} • NO: {round.noCount}
                  </p>
                  <p className="text-sm font-medium">
                    Minority: {round.minorityVote ? 'YES' : 'NO'} • Remaining:{' '}
                    {round.remainingPlayers}
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
                  <span className="font-mono text-sm">{formatAddress(winner.playerAddress)}</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatWei(winner.prizeAmount)} ETH
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
