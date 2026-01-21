'use client';

import { useMemo, memo } from 'react';
import type { Player, Commit, Vote, Elimination } from '@/lib/supabase';

interface SimplePlayerListProps {
  players: Player[];
  commits: Commit[];
  votes: Vote[];
  eliminations: Elimination[];
  gameState: string;
  currentUserAddress?: string;
}

interface PlayerRowProps {
  address: string;
  hasCommitted: boolean;
  hasRevealed: boolean;
  isCurrentUser: boolean;
  isEliminated: boolean;
}

const PlayerRow = memo(function PlayerRow({
  address,
  hasCommitted,
  hasRevealed,
  isCurrentUser,
  isEliminated
}: PlayerRowProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded ${
      isCurrentUser ? 'bg-primary/10' : ''
    } ${isEliminated ? 'opacity-50' : ''}`}>
      <span className={`text-sm font-mono truncate ${isEliminated ? 'line-through' : ''}`}>
        {formatAddress(address)}
        {isCurrentUser && <span className="ml-2 text-xs text-primary font-bold">YOU</span>}
        {isEliminated && <span className="ml-2 text-xs text-red-400">✗ Eliminated</span>}
      </span>
      <div className="flex gap-2 text-green-400">
        {!isEliminated && hasCommitted && <span title="Committed">✓</span>}
        {!isEliminated && hasRevealed && <span title="Revealed">✓</span>}
      </div>
    </div>
  );
});

export const SimplePlayerList = memo(function SimplePlayerList({
  players,
  commits,
  votes,
  eliminations,
  gameState,
  currentUserAddress
}: SimplePlayerListProps) {
  const playerStatuses = useMemo(() => {
    // O(n) using Map
    const commitMap = new Map(
      commits.map(c => [c.player_address.toLowerCase(), true])
    );
    const voteMap = new Map(
      votes.map(v => [v.player_address.toLowerCase(), true])
    );
    const eliminationMap = new Map(
      eliminations.filter(e => e.eliminated).map(e => [e.player_address.toLowerCase(), true])
    );
    const normalizedUser = currentUserAddress?.toLowerCase();

    return players.map(p => {
      const addr = p.player_address.toLowerCase();
      return {
        address: p.player_address,
        hasCommitted: commitMap.has(addr),
        hasRevealed: voteMap.has(addr),
        isCurrentUser: addr === normalizedUser,
        isEliminated: eliminationMap.has(addr),
      };
    });
  }, [players, commits, votes, eliminations, currentUserAddress]);

  const committedCount = playerStatuses.filter(p => !p.isEliminated && p.hasCommitted).length;
  const revealedCount = playerStatuses.filter(p => !p.isEliminated && p.hasRevealed).length;
  const activeCount = playerStatuses.filter(p => !p.isEliminated).length;
  const eliminatedCount = playerStatuses.filter(p => p.isEliminated).length;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold">Players ({players.length})</h3>
          {eliminatedCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {activeCount} active • {eliminatedCount} eliminated
            </p>
          )}
        </div>
        {gameState === 'CommitPhase' && (
          <span className="text-sm text-muted-foreground">
            {committedCount}/{activeCount} committed
          </span>
        )}
        {gameState === 'RevealPhase' && (
          <span className="text-sm text-muted-foreground">
            {revealedCount}/{activeCount} revealed
          </span>
        )}
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {playerStatuses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No players yet
          </p>
        ) : (
          playerStatuses.map(status => (
            <PlayerRow key={status.address} {...status} />
          ))
        )}
      </div>
    </div>
  );
});
