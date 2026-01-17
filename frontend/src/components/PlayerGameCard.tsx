'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePlayerGameDetail } from '@/hooks/queries/use-player-game-details';
import { formatWei, getGameStateLabel } from '@/lib/utils';
import { Vote, Round } from '@/lib/supabase';

interface PlayerGameCardProps {
  playerAddress: string;
  gameId: string;
}

interface RoundVoteDisplay {
  round: number;
  vote: boolean | null;
  survived: boolean;
  roundStats: Round | null;
}

export function PlayerGameCard({ playerAddress, gameId }: PlayerGameCardProps) {
  const { data: gameDetail, isLoading } = usePlayerGameDetail(playerAddress, gameId);

  if (isLoading) {
    return (
      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading game details...</p>
        </CardContent>
      </Card>
    );
  }

  if (!gameDetail) {
    return null;
  }

  const { game, player_info, votes, rounds, is_winner, prize_amount } = gameDetail;

  // Build round-by-round vote display with survival status
  const roundVoteDisplays: RoundVoteDisplay[] = [];

  // Sort votes by round
  const sortedVotes = [...votes].sort((a, b) => a.round - b.round);

  // Get max round from rounds or votes
  const maxRound = Math.max(
    rounds.length > 0 ? Math.max(...rounds.map(r => r.round)) : 0,
    votes.length > 0 ? Math.max(...votes.map(v => v.round)) : 0
  );

  for (let roundNum = 1; roundNum <= maxRound; roundNum++) {
    const vote = sortedVotes.find((v) => v.round === roundNum);
    const roundStats = rounds.find((r) => r.round === roundNum);

    if (vote && roundStats) {
      // Player voted in this round
      const votedMinority = vote.vote === roundStats.minority_vote;
      const hasNextVote = sortedVotes.some((v) => v.round === roundNum + 1);
      const survived = votedMinority && (hasNextVote || is_winner);

      roundVoteDisplays.push({
        round: roundNum,
        vote: vote.vote,
        survived,
        roundStats,
      });
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg leading-tight">
              {game.question_text || `Game #${game.game_id}`}
            </CardTitle>
            {is_winner && (
              <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded whitespace-nowrap">
                WINNER
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
              {getGameStateLabel(game.state)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Entry Fee</div>
            <div className="font-mono text-sm font-bold">
              {formatWei(player_info.joined_amount)} ETH
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Rounds Played</div>
            <div className="font-mono text-sm font-bold">{roundVoteDisplays.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Prize Won</div>
            <div className={`font-mono text-sm font-bold ${prize_amount && BigInt(prize_amount) > 0 ? 'text-green-500' : ''}`}>
              {prize_amount ? `${formatWei(prize_amount)} ETH` : '0 ETH'}
            </div>
          </div>
        </div>

        {/* Vote History Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Vote History</h4>

          {roundVoteDisplays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No votes revealed yet
            </p>
          ) : (
            <div className="space-y-3">
              {roundVoteDisplays.map(({ round, vote, survived, roundStats }) => (
                <div
                  key={round}
                  className="border-l-4 border-primary pl-4 py-2 space-y-2"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Round {round}</span>

                    {/* Vote Badge */}
                    {vote !== null && (
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          vote
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-white'
                        }`}
                      >
                        {vote ? 'YES' : 'NO'}
                      </span>
                    )}

                    {/* Survival Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded border ${
                        survived
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : 'bg-destructive/10 text-destructive border-destructive/30'
                      }`}
                    >
                      {survived ? 'SURVIVED' : 'ELIMINATED'}
                    </span>
                  </div>

                  {/* Round Stats */}
                  {roundStats && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>YES: {roundStats.yes_count}</span>
                        <span>NO: {roundStats.no_count}</span>
                        <span className="font-semibold">
                          Minority: {roundStats.minority_vote ? 'YES' : 'NO'}
                        </span>
                      </div>
                      <div>Remaining Players: {roundStats.remaining_players}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/game/${game.game_id}`}>
          <Button variant="outline" className="w-full">
            View Full Game Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
