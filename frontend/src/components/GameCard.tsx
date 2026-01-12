'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Game } from '@/lib/supabase';
import { formatWei, getGameStateLabel, getGameStateColor, getTimeRemaining } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!game.commitDeadline && !game.revealDeadline) return;

    const updateTimer = () => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{game.questionText}</CardTitle>
            <CardDescription className="mt-1">
              Game #{game.id} • Round {game.currentRound}
            </CardDescription>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full text-white ${getGameStateColor(game.state)}`}
          >
            {getGameStateLabel(game.state)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Entry Fee</p>
            <p className="font-semibold">{formatWei(game.entryFee)} ETH</p>
          </div>
          <div>
            <p className="text-muted-foreground">Prize Pool</p>
            <p className="font-semibold">{formatWei(game.prizePool)} ETH</p>
          </div>
          <div>
            <p className="text-muted-foreground">Players</p>
            <p className="font-semibold">{game.totalPlayers}</p>
          </div>
          {timeLeft && (
            <div>
              <p className="text-muted-foreground">Time Left</p>
              <p className="font-semibold">{timeLeft}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/game/${game.id}`} className="w-full">
          <Button className="w-full">View Game</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
