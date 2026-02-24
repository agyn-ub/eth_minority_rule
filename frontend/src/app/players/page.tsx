'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { useAllPlayers } from '@/hooks/queries/use-all-players';
import { useDebounce } from '@/hooks/use-debounce';
import { formatAddress, formatWei, cn } from '@/lib/utils';

const ROWS_PER_PAGE = 20;

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  const { data: players, isLoading } = useAllPlayers();

  // Filter by search
  const filtered = useMemo(() => {
    if (!players) return [];
    if (!debouncedSearch) return players;
    const q = debouncedSearch.toLowerCase();
    return players.filter((p) => p.address.includes(q));
  }, [players, debouncedSearch]);

  // Reset to page 1 when search changes
  const effectivePage = useMemo(() => {
    const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
    return page > totalPages ? 1 : page;
  }, [filtered.length, page]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice(
    (effectivePage - 1) * ROWS_PER_PAGE,
    effectivePage * ROWS_PER_PAGE
  );

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-8">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-accent to-primary"></div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary"></div>
            <h1 className="text-xl font-bold tracking-tight">
              Player <span className="text-primary">Statistics</span>
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Browse all players or search by address.{' '}
            <span className="text-accent font-bold">Track performance.</span>{' '}
            <span className="text-primary font-bold">Analyze strategies.</span>
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find a Player</CardTitle>
          <CardDescription>
            Enter a wallet address to view detailed statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerSearchBar />
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Players</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Loading...'
                  : `${filtered.length} player${filtered.length !== 1 ? 's' : ''} found`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Filter by address..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {debouncedSearch
                ? `No players matching "${debouncedSearch}"`
                : 'No players found'}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-2 font-medium w-12">#</th>
                      <th className="text-left py-3 px-2 font-medium">Address</th>
                      <th className="text-right py-3 px-2 font-medium">Games</th>
                      <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">Wins</th>
                      <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">Win Rate</th>
                      <th className="text-right py-3 px-2 font-medium hidden md:table-cell">Total Prizes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((player, i) => {
                      const rank = (effectivePage - 1) * ROWS_PER_PAGE + i + 1;
                      return (
                        <tr
                          key={player.address}
                          onClick={() => router.push(`/player/${player.address}`)}
                          className={cn(
                            'border-b border-border/50 cursor-pointer transition-colors',
                            'hover:bg-primary/5'
                          )}
                        >
                          <td className="py-3 px-2 text-muted-foreground">{rank}</td>
                          <td className="py-3 px-2 font-mono">
                            <span className="hidden sm:inline">{player.address}</span>
                            <span className="sm:hidden">{formatAddress(player.address)}</span>
                          </td>
                          <td className="py-3 px-2 text-right">{player.totalGames}</td>
                          <td className="py-3 px-2 text-right hidden sm:table-cell">{player.totalWins}</td>
                          <td className="py-3 px-2 text-right hidden sm:table-cell">
                            {(player.winRate * 100).toFixed(0)}%
                          </td>
                          <td className="py-3 px-2 text-right font-mono hidden md:table-cell">
                            {formatWei(player.totalPrizes)} ETH
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={effectivePage}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filtered.length}
                itemsPerPage={ROWS_PER_PAGE}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
