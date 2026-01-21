'use client';

import { memo, useState, useEffect } from 'react';

interface SimpleBannerProps {
  gameId: number;
  gameState: string;
  deadline: string | null;
  questionText: string;
  currentRound: number;
}

export const SimpleBanner = memo(function SimpleBanner({
  gameId,
  gameState,
  deadline,
  questionText,
  currentRound
}: SimpleBannerProps) {
  // Live updating countdown timer
  const [timeRemaining, setTimeRemaining] = useState(() =>
    deadline ? Math.max(0, Number(deadline) - Math.floor(Date.now() / 1000)) : 0
  );

  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Number(deadline) - Math.floor(Date.now() / 1000));
      setTimeRemaining(remaining);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [deadline]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  let timeText = timeRemaining > 0
    ? hours > 0
      ? `${hours}h ${minutes}m ${seconds}s remaining`
      : `${minutes}m ${seconds}s remaining`
    : 'Deadline passed';

  const stateLabels: Record<string, string> = {
    ZeroPhase: 'Waiting for players',
    CommitPhase: 'Commit Phase',
    RevealPhase: 'Reveal Phase',
    Completed: 'Game Complete'
  };

  const stateColors: Record<string, string> = {
    ZeroPhase: 'bg-gray-500',
    CommitPhase: 'bg-blue-500',
    RevealPhase: 'bg-yellow-500',
    Completed: 'bg-green-500'
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${stateColors[gameState] || 'bg-gray-500'}`} />
          <span className="text-sm font-bold uppercase">
            {stateLabels[gameState] || gameState}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            Game #{gameId}
          </span>
          <span className="text-sm text-muted-foreground">
            Round {currentRound}
          </span>
        </div>
      </div>

      <div className="bg-primary/10 border-l-4 border-primary rounded p-3 mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Question</p>
        <h1 className="text-xl font-bold text-foreground">
          {questionText || `Game Round ${currentRound}`}
        </h1>
      </div>

      {deadline && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            ⏱ {timeText}
          </p>
          {timeRemaining > 0 && (
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (timeRemaining / 3600) * 100)}%`
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});
