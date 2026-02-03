'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GraphQLElimination } from '@/hooks/queries/use-game-eliminations';

interface EliminatedPlayersCardProps {
  eliminations: GraphQLElimination[];
  currentUserAddress?: string;
  gameState: string;
}

interface PlayerRowProps {
  address: string;
  isActive: boolean;
  eliminatedRound?: number | null;
  isCurrentUser: boolean;
}

function StatusIndicator({ isActive, eliminatedRound }: { isActive: boolean; eliminatedRound?: number | null }) {
  if (isActive) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-success text-lg">✅</span>
        <span className="text-xs text-success font-bold uppercase tracking-wider">Active</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-destructive text-lg">❌</span>
      <span className="text-xs text-muted-foreground">Round {eliminatedRound ?? '?'}</span>
    </div>
  );
}

function PlayerRow({ address, isActive, eliminatedRound, isCurrentUser }: PlayerRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-colors ${
        isCurrentUser
          ? 'bg-primary/10 border-primary/30'
          : 'bg-card border-border/50 hover:bg-accent/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/player/${address}`}
          className="font-mono text-sm hover:text-primary transition-colors underline decoration-dotted break-all"
        >
          {address}
        </Link>
        {isCurrentUser && (
          <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded font-bold uppercase tracking-wider">
            YOU
          </span>
        )}
      </div>
      <StatusIndicator isActive={isActive} eliminatedRound={eliminatedRound} />
    </div>
  );
}

export function EliminatedPlayersCard({
  eliminations,
  currentUserAddress,
  gameState,
}: EliminatedPlayersCardProps) {
  // Group eliminations by active/eliminated status and round
  const groupedPlayers = useMemo(() => {
    const activePlayers: GraphQLElimination[] = [];
    const eliminatedByRound = new Map<number, GraphQLElimination[]>();

    eliminations.forEach((elimination) => {
      if (!elimination.eliminated) {
        activePlayers.push(elimination);
      } else if (elimination.eliminated_round !== null) {
        const round = elimination.eliminated_round;
        const players = eliminatedByRound.get(round) || [];
        players.push(elimination);
        eliminatedByRound.set(round, players);
      }
    });

    // Sort active players alphabetically by address
    activePlayers.sort((a, b) => a.player_address.localeCompare(b.player_address));

    // Sort eliminated players within each round alphabetically by address
    eliminatedByRound.forEach((players) => {
      players.sort((a, b) => a.player_address.localeCompare(b.player_address));
    });

    // Get sorted round numbers (descending: Round 3 → 2 → 1)
    const rounds = Array.from(eliminatedByRound.keys()).sort((a, b) => b - a);

    return {
      activePlayers,
      eliminatedByRound,
      rounds,
    };
  }, [eliminations]);

  const totalPlayers = eliminations.length;
  const activeCount = groupedPlayers.activePlayers.length;
  const eliminatedCount = totalPlayers - activeCount;

  // Empty state
  if (totalPlayers === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Eliminations</CardTitle>
          <CardDescription>Track which players have been eliminated each round</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">No eliminations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Eliminations</CardTitle>
        <CardDescription>
          {activeCount} active, {eliminatedCount} eliminated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Players Section */}
        {groupedPlayers.activePlayers.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-success uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>✅</span>
              Active Players ({groupedPlayers.activePlayers.length})
            </h3>
            <div className="space-y-2">
              {groupedPlayers.activePlayers.map((elimination) => {
                const normalizedAddress = elimination.player_address.toLowerCase();
                const isCurrentUser = currentUserAddress
                  ? normalizedAddress === currentUserAddress.toLowerCase()
                  : false;

                return (
                  <PlayerRow
                    key={elimination.player_address}
                    address={elimination.player_address}
                    isActive={true}
                    isCurrentUser={isCurrentUser}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Eliminated Players Sections (grouped by round) */}
        {groupedPlayers.rounds.length > 0 && (
          <div className="space-y-4">
            {groupedPlayers.rounds.map((round) => {
              const players = groupedPlayers.eliminatedByRound.get(round) || [];

              return (
                <div key={round}>
                  <h3 className="text-sm font-bold text-destructive uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>❌</span>
                    Eliminated in Round {round} ({players.length})
                  </h3>
                  <div className="space-y-2">
                    {players.map((elimination) => {
                      const normalizedAddress = elimination.player_address.toLowerCase();
                      const isCurrentUser = currentUserAddress
                        ? normalizedAddress === currentUserAddress.toLowerCase()
                        : false;

                      return (
                        <PlayerRow
                          key={elimination.player_address}
                          address={elimination.player_address}
                          isActive={false}
                          eliminatedRound={elimination.eliminated_round}
                          isCurrentUser={isCurrentUser}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
