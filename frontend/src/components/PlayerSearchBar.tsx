'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { usePlayerSearch } from '@/hooks/queries/use-player-search';
import { formatAddress } from '@/lib/utils';

export function PlayerSearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = usePlayerSearch(debouncedQuery, {
    enabled: debouncedQuery.length >= 3,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show dropdown when there are results or loading
  useEffect(() => {
    if (debouncedQuery.length >= 3 && (isLoading || results.length > 0)) {
      setIsOpen(true);
    } else if (debouncedQuery.length < 3) {
      setIsOpen(false);
    }
  }, [debouncedQuery, isLoading, results]);

  const handlePlayerClick = (address: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/player/${address}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search players by wallet address (0x...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No players found matching &apos;{debouncedQuery}&apos;
              </div>
            ) : (
              <div className="divide-y">
                {results.map((player) => (
                  <div
                    key={player.player_address}
                    onClick={() => handlePlayerClick(player.player_address)}
                    className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium font-mono">
                          {formatAddress(player.player_address)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {player.player_address}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {player.game_count} {player.game_count === 1 ? 'game' : 'games'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
