'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { formatAddress } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import type { GraphQLPlayer } from '@/hooks/queries/use-game-players';
import type { GraphQLCommit, GraphQLVote } from '@/hooks/queries/use-game-votes';

interface PlayerStatusCardProps {
  gameId: number;
  currentRound: number;
  gameState: string;
  players: GraphQLPlayer[];
  commits: GraphQLCommit[];
  votes: GraphQLVote[];
  currentUserAddress?: string;
}

interface PlayerStatus {
  address: string;
  hasCommitted: boolean;
  hasRevealed: boolean;
  isCurrentUser: boolean;
}

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const progressColor = percentage === 100 ? 'bg-success' : percentage > 50 ? 'bg-primary' : 'bg-accent';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">
          {current}/{total}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PlayerStatusRow({ status, showCommit, showReveal }: {
  status: PlayerStatus;
  showCommit: boolean;
  showReveal: boolean;
}) {
  const getStatusDisplay = () => {
    if (showReveal) {
      if (status.hasRevealed) {
        return <span className="text-success text-lg">✅</span>;
      }
      return <span className="text-muted-foreground text-lg">⏳</span>;
    }

    if (showCommit) {
      if (status.hasCommitted) {
        return <span className="text-success text-lg">✅</span>;
      }
      return <span className="text-muted-foreground text-lg">⏳</span>;
    }

    return null;
  };

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-colors ${
        status.isCurrentUser
          ? 'bg-primary/10 border-primary/30'
          : 'bg-card border-border/50 hover:bg-accent/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/player/${status.address}`}
          className="font-mono text-sm hover:text-primary transition-colors underline decoration-dotted break-all"
        >
          {status.address}
        </Link>
        {status.isCurrentUser && (
          <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded font-bold uppercase tracking-wider">
            YOU
          </span>
        )}
      </div>
      {getStatusDisplay()}
    </div>
  );
}

const COLLAPSED_COUNT = 5;
const EXPANDED_PAGE_SIZE = 10;

export function PlayerStatusCard({
  gameId,
  currentRound,
  gameState,
  players,
  commits,
  votes,
  currentUserAddress,
}: PlayerStatusCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Merge player data with commit/reveal status
  const playerStatuses = useMemo(() => {
    const currentRoundCommits = commits.filter((c) => c.round === currentRound);
    const currentRoundVotes = votes.filter((v) => v.round === currentRound);

    const statuses: PlayerStatus[] = players.map((player) => {
      const normalizedAddress = player.player_address.toLowerCase();
      const commit = currentRoundCommits.find(
        (c) => c.player_address.toLowerCase() === normalizedAddress
      );
      const vote = currentRoundVotes.find(
        (v) => v.player_address.toLowerCase() === normalizedAddress
      );

      return {
        address: player.player_address,
        hasCommitted: !!commit,
        hasRevealed: !!vote,
        isCurrentUser: currentUserAddress
          ? normalizedAddress === currentUserAddress.toLowerCase()
          : false,
      };
    });

    // Sort: current user first, then committed/revealed first, then by address
    return statuses.sort((a, b) => {
      if (a.isCurrentUser && !b.isCurrentUser) return -1;
      if (!a.isCurrentUser && b.isCurrentUser) return 1;

      // In CommitPhase, sort by commit status
      if (gameState === 'CommitPhase') {
        if (a.hasCommitted && !b.hasCommitted) return -1;
        if (!a.hasCommitted && b.hasCommitted) return 1;
      }

      // In RevealPhase, sort by reveal status
      if (gameState === 'RevealPhase') {
        if (a.hasRevealed && !b.hasRevealed) return -1;
        if (!a.hasRevealed && b.hasRevealed) return 1;
      }

      return a.address.localeCompare(b.address);
    });
  }, [players, commits, votes, currentRound, gameState, currentUserAddress]);

  // Filter by search in expanded mode
  const filteredStatuses = useMemo(() => {
    if (!expanded || !debouncedSearch) return playerStatuses;
    const term = debouncedSearch.toLowerCase();
    return playerStatuses.filter((s) => s.address.toLowerCase().includes(term));
  }, [playerStatuses, debouncedSearch, expanded]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Calculate participation stats
  const committedCount = playerStatuses.filter((p) => p.hasCommitted).length;
  const revealedCount = playerStatuses.filter((p) => p.hasRevealed).length;
  const totalPlayers = playerStatuses.length;

  // Determine what to show based on game state
  const showCommitStatus = gameState === 'CommitPhase';
  const showRevealStatus = gameState === 'RevealPhase';
  const showBasicList = gameState === 'ZeroPhase' || gameState === 'Completed';

  // Pagination
  const displayStatuses = expanded
    ? filteredStatuses.slice((page - 1) * EXPANDED_PAGE_SIZE, page * EXPANDED_PAGE_SIZE)
    : playerStatuses.slice(0, COLLAPSED_COUNT);
  const totalPages = Math.ceil(filteredStatuses.length / EXPANDED_PAGE_SIZE);
  const remainingCount = totalPlayers - COLLAPSED_COUNT;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players ({totalPlayers})</CardTitle>
        <CardDescription>
          {showCommitStatus && 'Commit vote participation'}
          {showRevealStatus && 'Reveal vote participation'}
          {showBasicList && 'All participants in this game'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar - Only show during CommitPhase or RevealPhase */}
        {showCommitStatus && (
          <ProgressBar
            current={committedCount}
            total={totalPlayers}
            label="Players committed"
          />
        )}
        {showRevealStatus && (
          <ProgressBar
            current={revealedCount}
            total={totalPlayers}
            label="Players revealed"
          />
        )}

        {/* Search - Only in expanded mode */}
        {expanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Player List */}
        <div className="space-y-2">
          {displayStatuses.map((status) => (
            <PlayerStatusRow
              key={status.address}
              status={status}
              showCommit={showCommitStatus}
              showReveal={showRevealStatus}
            />
          ))}
        </div>

        {/* Collapsed: "and X more" + View All */}
        {!expanded && remainingCount > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              and {remainingCount} more player{remainingCount !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
              View All
            </Button>
          </div>
        )}

        {/* Expanded: Pagination + Show Less */}
        {expanded && (
          <>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filteredStatuses.length}
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
        )}

        {/* Empty State */}
        {totalPlayers === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">No players have joined yet</p>
          </div>
        )}

        {/* No search results */}
        {expanded && filteredStatuses.length === 0 && totalPlayers > 0 && (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">No players match &quot;{debouncedSearch}&quot;</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
