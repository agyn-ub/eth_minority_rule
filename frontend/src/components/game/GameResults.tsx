'use client';

import { useState, useMemo } from 'react';
import { useGameHistory } from '@/hooks/queries/use-game-history';
import { formatEther } from 'viem';

interface GameResultsProps {
  gameId: number;
}

export function GameResults({ gameId }: GameResultsProps) {
  const [showHistory, setShowHistory] = useState(false);
  const { data: history, refetch, isLoading } = useGameHistory(gameId, {
    enabled: false
  });

  const handleToggleHistory = () => {
    if (!showHistory) {
      refetch();
    }
    setShowHistory(!showHistory);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Process round data to show survivors and eliminated players
  const roundDetails = useMemo(() => {
    if (!history) return [];

    return history.rounds.map((round) => {
      // Get votes for this round
      const roundVotes = history.votes.filter(v => v.round === round.round);

      // Find survivors (minority voters)
      const survivors = roundVotes.filter(v => v.vote === round.minority_vote);

      // Find eliminated players in this round
      const eliminated = history.eliminations.filter(
        e => e.eliminated && e.eliminated_round === round.round
      );

      return {
        round,
        survivors,
        eliminated
      };
    });
  }, [history]);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Game Complete</h2>
        <button
          onClick={handleToggleHistory}
          className="text-sm text-primary hover:underline"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : showHistory ? 'Hide History' : 'Show Round History'}
        </button>
      </div>

      {showHistory && history && (
        <>
          {/* Round History */}
          {roundDetails.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Round History</h3>
              {roundDetails.map(({ round, survivors, eliminated }) => (
                <div key={round.id} className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold">Round {round.round}</p>
                    <p className="text-xs text-muted-foreground">
                      {round.remaining_players} remaining
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground">
                      YES: {round.yes_count} • NO: {round.no_count} •
                      <span className="font-semibold ml-1">
                        Minority: {round.minority_vote ? 'YES' : 'NO'}
                      </span>
                    </p>

                    {/* Survivors */}
                    {survivors.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                        <p className="font-semibold text-green-400 mb-1">
                          ✓ Survived ({survivors.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {survivors.map((v) => (
                            <span
                              key={v.id}
                              className="font-mono text-xs bg-green-500/20 px-2 py-0.5 rounded"
                            >
                              {formatAddress(v.player_address)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Eliminated */}
                    {eliminated.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                        <p className="font-semibold text-red-400 mb-1">
                          ✗ Eliminated ({eliminated.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {eliminated.map((e) => (
                            <span
                              key={e.player_address}
                              className="font-mono text-xs bg-red-500/20 px-2 py-0.5 rounded line-through"
                            >
                              {formatAddress(e.player_address)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Winners */}
          {history.winners && history.winners.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">
                🏆 {history.winners.length === 1 ? 'Winner' : 'Winners'}
              </h3>
              <div className="space-y-2">
                {history.winners.map((winner) => (
                  <div key={winner.id} className="flex justify-between items-center text-sm bg-green-500/10 border border-green-500/30 p-3 rounded">
                    <span className="font-mono font-semibold">{formatAddress(winner.player_address)}</span>
                    <span className="text-green-400 font-bold text-base">
                      {formatEther(BigInt(winner.prize_amount))} ETH
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showHistory && !history && !isLoading && (
        <p className="text-sm text-muted-foreground text-center">
          No history available
        </p>
      )}
    </div>
  );
}
