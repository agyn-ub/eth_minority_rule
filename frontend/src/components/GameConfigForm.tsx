'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import { useGameMutations } from '@/hooks/mutations/use-game-mutations';

interface GameConfigFormProps {
  gameId: number;
  currentState: string;
}

export function GameConfigForm({ gameId, currentState }: GameConfigFormProps) {
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const { invalidateGame } = useGameMutations();

  const [commitDuration, setCommitDuration] = useState<string>('300'); // 5 minutes default
  const [revealDuration, setRevealDuration] = useState<string>('180'); // 3 minutes default

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      invalidateGame(gameId);
      toast({
        title: 'Success',
        description: 'Deadline set successfully!',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, gameId]);

  const handleSetCommitDeadline = async () => {
    if (!chainId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    const duration = parseInt(commitDuration);
    if (isNaN(duration) || duration <= 0) {
      toast({
        title: 'Error',
        description: 'Duration must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: MinorityRuleGameAbi,
        functionName: 'setCommitDeadline',
        args: [BigInt(gameId), BigInt(duration)],
      });

      toast({
        title: 'Setting Commit Deadline',
        description: `Starting commit phase with ${duration} seconds...`,
      });
    } catch (error: any) {
      console.error('Error setting commit deadline:', error);

      let errorMessage = 'Failed to set deadline. Please try again.';

      if (error.message?.includes('Only creator')) {
        errorMessage = 'Only the game creator can set deadlines.';
      } else if (error.message?.includes('NotInZeroPhase')) {
        errorMessage = 'Commit deadline can only be set in ZeroPhase.';
      } else if (error.message?.includes('InvalidDuration')) {
        errorMessage = 'Duration must be greater than 0.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSetRevealDeadline = async () => {
    if (!chainId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    const duration = parseInt(revealDuration);
    if (isNaN(duration) || duration <= 0) {
      toast({
        title: 'Error',
        description: 'Duration must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: MinorityRuleGameAbi,
        functionName: 'setRevealDeadline',
        args: [BigInt(gameId), BigInt(duration)],
      });

      toast({
        title: 'Setting Reveal Deadline',
        description: `Starting reveal phase with ${duration} seconds...`,
      });
    } catch (error: any) {
      console.error('Error setting reveal deadline:', error);

      let errorMessage = 'Failed to set deadline. Please try again.';

      if (error.message?.includes('Only creator')) {
        errorMessage = 'Only the game creator can set deadlines.';
      } else if (error.message?.includes('NotInCommitPhase')) {
        errorMessage = 'Reveal deadline can only be set in CommitPhase.';
      } else if (error.message?.includes('CommitDeadlineNotPassed')) {
        errorMessage = 'Commit deadline has not passed yet. Please wait.';
      } else if (error.message?.includes('NoCommitsYet')) {
        errorMessage = 'At least one player must commit before starting reveal phase.';
      } else if (error.message?.includes('InvalidDuration')) {
        errorMessage = 'Duration must be greater than 0.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Show loading state while transaction is processing
  if (isPending || isConfirming) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Setting Deadline...</CardTitle>
          <CardDescription>
            {isPending && 'Please confirm the transaction in MetaMask'}
            {isConfirming && 'Waiting for blockchain confirmation...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // Show success state after transaction confirms
  if (isSuccess) {
    return (
      <Card className="border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700">✅ Deadline Set Successfully!</CardTitle>
          <CardDescription>Phase has started</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Players can now participate in this phase.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show commit deadline form in ZeroPhase
  if (currentState === 'ZeroPhase') {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>⚙️ Configure Game</CardTitle>
          <CardDescription>
            Set the commit deadline to start the game. Players can join and commit their votes during this phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commitDuration">Commit Phase Duration (seconds)</Label>
            <Input
              id="commitDuration"
              type="number"
              min="1"
              value={commitDuration}
              onChange={(e) => setCommitDuration(e.target.value)}
              placeholder="300"
            />
            <p className="text-xs text-muted-foreground">
              Suggested: 300s (5 min) for testing, 3600s (1 hour) for real games
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommitDuration('60')}
            >
              1 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommitDuration('300')}
            >
              5 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommitDuration('3600')}
            >
              1 hour
            </Button>
          </div>

          {commitDuration && parseInt(commitDuration) > 0 && (
            <p className="text-sm text-muted-foreground">
              Deadline will be: {new Date(Date.now() + parseInt(commitDuration) * 1000).toLocaleString()}
            </p>
          )}

          <Button
            onClick={handleSetCommitDeadline}
            disabled={!address || isPending || isConfirming}
            className="w-full"
            size="lg"
          >
            {isPending || isConfirming ? 'Setting Deadline...' : 'Start Commit Phase'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Once set, players can join the game and commit their votes until the deadline.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show reveal deadline form in CommitPhase (after deadline passed)
  if (currentState === 'CommitPhase') {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>⚙️ Start Reveal Phase</CardTitle>
          <CardDescription>
            Commit phase has ended. Set the reveal deadline to allow players to reveal their votes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revealDuration">Reveal Phase Duration (seconds)</Label>
            <Input
              id="revealDuration"
              type="number"
              min="1"
              value={revealDuration}
              onChange={(e) => setRevealDuration(e.target.value)}
              placeholder="180"
            />
            <p className="text-xs text-muted-foreground">
              Suggested: 180s (3 min) for testing, 1800s (30 min) for real games
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealDuration('60')}
            >
              1 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealDuration('180')}
            >
              3 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealDuration('1800')}
            >
              30 min
            </Button>
          </div>

          {revealDuration && parseInt(revealDuration) > 0 && (
            <p className="text-sm text-muted-foreground">
              Deadline will be: {new Date(Date.now() + parseInt(revealDuration) * 1000).toLocaleString()}
            </p>
          )}

          <Button
            onClick={handleSetRevealDeadline}
            disabled={!address || isPending || isConfirming}
            className="w-full"
            size="lg"
          >
            {isPending || isConfirming ? 'Setting Deadline...' : 'Start Reveal Phase'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Players who committed votes can now reveal them until the deadline.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null; // Don't show in RevealPhase or Completed
}
