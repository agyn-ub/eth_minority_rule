'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Game } from '@/lib/supabase';
import { formatWei, getGameStateLabel } from '@/lib/utils';
import { TimerProgress } from '@/components/TimerProgress';
import { getGameStateShape, SQUID_SHAPES } from '@/lib/squid-shapes';

interface GameCardProps {
  game: Game;
}

// Helper function to get state-based background color
function getStateBgColor(state: string): string {
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
}


export function GameCard({ game }: GameCardProps) {
  const stateBgColor = getStateBgColor(game.state);
  const stateLabel = getGameStateLabel(game.state);
  const stateShape = getGameStateShape(game.state);

  const currentDeadline =
    game.state === 'CommitPhase' && game.commit_deadline
      ? Number(game.commit_deadline)
      : game.state === 'RevealPhase' && game.reveal_deadline
      ? Number(game.reveal_deadline)
      : null;

  return (
    <Card className="overflow-hidden game-card-hover group cursor-pointer border-border bg-card">
      <Link href={`/game/${game.game_id}`} className="block">
        {/* State Header Bar - Squid Game Style */}
        <div className={`${stateBgColor} px-4 py-3 relative`}>
          <div className="absolute left-0 top-0 w-1 h-full bg-white/30"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span className="text-base">{stateShape}</span>
              {stateLabel}
            </span>
          </div>
          {currentDeadline && (
            <div className="opacity-90">
              <TimerProgress
                deadline={currentDeadline}
                label=""
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Question Display */}
        <div className="px-5 py-5 border-l-2 border-transparent group-hover:border-primary transition-colors">
          <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem] leading-tight">
            {game.question_text || `Game #${game.game_id}`}
          </h3>
        </div>

        {/* Stats Grid - Squid Game Style */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-3 gap-3">
            {/* Prize Pool */}
            <div className="text-center p-3 rounded bg-gradient-to-br from-surface-elevated to-accent/5 border border-accent/20 group-hover:border-accent/40 transition-colors">
              <div className="text-xl mb-1 text-accent">{SQUID_SHAPES.star}</div>
              <div className="text-base font-bold text-accent">
                {formatWei(game.prize_pool)}
              </div>
              <div className="text-xs text-muted-foreground tracking-normal">
                ETH
              </div>
            </div>

            {/* Players */}
            <div className="text-center p-3 rounded bg-gradient-to-br from-surface-elevated to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors">
              <div className="text-xl mb-1 text-primary">{SQUID_SHAPES.circle}</div>
              <div className="text-base font-bold text-foreground">
                {game.total_players}
              </div>
              <div className="text-xs text-muted-foreground tracking-normal">
                Players
              </div>
            </div>

            {/* Round */}
            <div className="text-center p-3 rounded bg-gradient-to-br from-surface-elevated to-surface-elevated border border-border/30 group-hover:border-border/60 transition-colors">
              <div className="text-xl mb-1">{SQUID_SHAPES.triangle}</div>
              <div className="text-base font-bold text-foreground">
                R{game.current_round}
              </div>
              <div className="text-xs text-muted-foreground tracking-normal">
                Round
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-5 pb-5">
          <Button
            variant="gradient"
            className="w-full h-12 text-sm"
            asChild
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{stateShape}</span>
              <span>
                {game.state === 'ZeroPhase' && `Join - ${formatWei(game.entry_fee)} ETH`}
                {game.state === 'CommitPhase' && 'Vote Now'}
                {game.state === 'RevealPhase' && 'Reveal Vote'}
                {game.state === 'Completed' && 'View Results'}
              </span>
            </div>
          </Button>
        </div>

        {/* Metadata Footer */}
        <div className="px-5 pb-4 flex items-center justify-between border-t border-border/30 pt-3">
          <span className="text-xs text-muted-foreground font-mono">
            Game #{game.game_id}
          </span>
          <span className="text-xs text-accent font-bold">
            {formatWei(game.entry_fee)} ETH
          </span>
        </div>
      </Link>
    </Card>
  );
}
