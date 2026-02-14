'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
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

const COLLAPSED_COUNT = 5;
const EXPANDED_PAGE_SIZE = 10;

export function EliminatedPlayersCard({
  eliminations,
  currentUserAddress,
  gameState,
}: EliminatedPlayersCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Build flat sorted list: active first, then eliminated by round desc
  const flatList = useMemo(() => {
    const active: GraphQLElimination[] = [];
    const eliminated: GraphQLElimination[] = [];

    eliminations.forEach((e) => {
      if (!e.eliminated) {
        active.push(e);
      } else {
        eliminated.push(e);
      }
    });

    active.sort((a, b) => a.player_address.localeCompare(b.player_address));
    eliminated.sort((a, b) => {
      const roundDiff = (b.eliminated_round ?? 0) - (a.eliminated_round ?? 0);
      if (roundDiff !== 0) return roundDiff;
      return a.player_address.localeCompare(b.player_address);
    });

    return [...active, ...eliminated];
  }, [eliminations]);

  // Group eliminations by active/eliminated status and round (for collapsed view)
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

    activePlayers.sort((a, b) => a.player_address.localeCompare(b.player_address));
    eliminatedByRound.forEach((players) => {
      players.sort((a, b) => a.player_address.localeCompare(b.player_address));
    });

    const rounds = Array.from(eliminatedByRound.keys()).sort((a, b) => b - a);

    return { activePlayers, eliminatedByRound, rounds };
  }, [eliminations]);

  // Filter by search in expanded mode
  const filteredList = useMemo(() => {
    if (!expanded || !debouncedSearch) return flatList;
    const term = debouncedSearch.toLowerCase();
    return flatList.filter((e) => e.player_address.toLowerCase().includes(term));
  }, [flatList, debouncedSearch, expanded]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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

  // Collapsed view: show first COLLAPSED_COUNT entries from the grouped view
  const renderCollapsedView = () => {
    let rendered = 0;
    const elements: React.ReactNode[] = [];

    // Render active players (up to limit)
    if (groupedPlayers.activePlayers.length > 0 && rendered < COLLAPSED_COUNT) {
      const activeToShow = groupedPlayers.activePlayers.slice(0, COLLAPSED_COUNT - rendered);
      elements.push(
        <div key="active">
          <h3 className="text-sm font-bold text-success uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>✅</span>
            Active Players ({groupedPlayers.activePlayers.length})
          </h3>
          <div className="space-y-2">
            {activeToShow.map((elimination) => {
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
      );
      rendered += activeToShow.length;
    }

    // Render eliminated rounds (up to remaining limit)
    if (rendered < COLLAPSED_COUNT) {
      for (const round of groupedPlayers.rounds) {
        if (rendered >= COLLAPSED_COUNT) break;
        const players = groupedPlayers.eliminatedByRound.get(round) || [];
        const toShow = players.slice(0, COLLAPSED_COUNT - rendered);
        elements.push(
          <div key={`round-${round}`}>
            <h3 className="text-sm font-bold text-destructive uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>❌</span>
              Eliminated in Round {round} ({players.length})
            </h3>
            <div className="space-y-2">
              {toShow.map((elimination) => {
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
        rendered += toShow.length;
      }
    }

    const remaining = totalPlayers - COLLAPSED_COUNT;

    return (
      <>
        <div className="space-y-6">{elements}</div>
        {remaining > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              and {remaining} more player{remaining !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
              View All
            </Button>
          </div>
        )}
      </>
    );
  };

  // Expanded view: flat searchable/paginated list
  const renderExpandedView = () => {
    const pageItems = filteredList.slice(
      (page - 1) * EXPANDED_PAGE_SIZE,
      page * EXPANDED_PAGE_SIZE
    );
    const totalPages = Math.ceil(filteredList.length / EXPANDED_PAGE_SIZE);

    return (
      <>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          {pageItems.map((elimination) => {
            const normalizedAddress = elimination.player_address.toLowerCase();
            const isCurrentUser = currentUserAddress
              ? normalizedAddress === currentUserAddress.toLowerCase()
              : false;
            return (
              <PlayerRow
                key={elimination.player_address}
                address={elimination.player_address}
                isActive={!elimination.eliminated}
                eliminatedRound={elimination.eliminated_round}
                isCurrentUser={isCurrentUser}
              />
            );
          })}
        </div>

        {filteredList.length === 0 && totalPlayers > 0 && (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">No players match &quot;{debouncedSearch}&quot;</p>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredList.length}
          itemsPerPage={EXPANDED_PAGE_SIZE}
          itemLabel="players"
        />

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(false);
              setSearch('');
              setPage(1);
            }}
          >
            Show Less
          </Button>
        </div>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Eliminations</CardTitle>
        <CardDescription>
          {activeCount} active, {eliminatedCount} eliminated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {expanded ? renderExpandedView() : renderCollapsedView()}
      </CardContent>
    </Card>
  );
}
