'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';

export default function PlayersPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-accent to-primary"></div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary"></div>
            <h1 className="text-xl font-bold tracking-tight">
              Player <span className="text-primary">Statistics</span>
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Search for any player to view their game history and voting patterns.{' '}
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

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Find</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Complete game participation history across all games</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
              <span>Detailed vote history for every round with YES/NO tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Win/loss record and total prizes won in ETH</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
              <span>Round-by-round survival tracking and elimination status</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
