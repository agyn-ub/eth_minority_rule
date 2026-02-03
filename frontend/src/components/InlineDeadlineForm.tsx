'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import type { Game } from '@/lib/supabase';

interface InlineDeadlineFormProps {
  game: Game;
  currentTime?: number; // Unix timestamp in seconds (optional for backward compatibility)
}

export function InlineDeadlineForm({ game, currentTime }: InlineDeadlineFormProps) {
  const { address } = useAccount();
  const { toast } = useToast();

  const [commitDuration, setCommitDuration] = useState('300');
  const [revealDuration, setRevealDuration] = useState('180');

  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Determine which form to show
  const canSetCommitDeadline = game.state === 'ZeroPhase';

  // Use provided currentTime or fallback to Date.now()
  const now = currentTime ? currentTime * 1000 : Date.now();

  const canSetRevealDeadline =
    game.state === 'CommitPhase' &&
    game.commit_deadline &&
    now > Number(game.commit_deadline) * 1000;

  // Show success toast when transaction confirms
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Transaction confirmed',
        description: 'Waiting for indexer to process the event...',
      });
    }
  }, [isSuccess, toast]);

  // Reset transaction state when game state changes
  // This allows form to reappear for setting reveal deadline
  useEffect(() => {
    if (isSuccess && game.state !== 'ZeroPhase') {
      // Give a moment for WebSocket to show success toast
      const timer = setTimeout(() => {
        reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [game.state, isSuccess, reset]);

  // Handle transaction errors
  useEffect(() => {
    if (isError) {
      handleError(error);
      reset(); // Allow retry
    }
  }, [isError, error, reset]);

  const handleSetCommitDeadline = async (e: React.FormEvent) => {
    e.preventDefault();

    const duration = Number(commitDuration);
    if (!duration || duration <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid duration greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      writeContract({
        address: getContractAddress(31337), // Using Anvil chain ID
        abi: MinorityRuleGameAbi,
        functionName: 'setCommitDeadline',
        args: [BigInt(game.game_id), BigInt(duration)],
      });
    } catch (error) {
      console.error('Error setting commit deadline:', error);
      handleError(error);
    }
  };

  const handleSetRevealDeadline = async (e: React.FormEvent) => {
    e.preventDefault();

    const duration = Number(revealDuration);
    if (!duration || duration <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid duration greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      writeContract({
        address: getContractAddress(31337), // Using Anvil chain ID
        abi: MinorityRuleGameAbi,
        functionName: 'setRevealDeadline',
        args: [BigInt(game.game_id), BigInt(duration)],
      });
    } catch (error) {
      console.error('Error setting reveal deadline:', error);
      handleError(error);
    }
  };

  const handleError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('OnlyCreator')) {
      toast({
        title: 'Error',
        description: 'Only the game creator can set deadlines',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('NotInZeroPhase')) {
      toast({
        title: 'Error',
        description: 'Commit deadline can only be set during the setup phase',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('NotInCommitPhase')) {
      toast({
        title: 'Error',
        description: 'Reveal deadline can only be set during the commit phase',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('CommitDeadlineNotPassed')) {
      toast({
        title: 'Error',
        description: 'Wait for the commit phase to start before setting reveal deadline',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('NoCommitsYet')) {
      toast({
        title: 'Error',
        description: 'At least one player must commit before you can set the reveal deadline',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('InvalidDuration')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid duration greater than 0',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Don't show anything if no deadline can be set OR transaction succeeded
  if ((!canSetCommitDeadline && !canSetRevealDeadline) || isSuccess) {
    return null;
  }

  // Loading state
  if (isPending || isConfirming) {
    return (
      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">
              {isPending && 'Please confirm in MetaMask'}
              {isConfirming && 'Waiting for blockchain confirmation...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Commit deadline form
  if (canSetCommitDeadline) {
    return (
      <Card className="border-primary/30 mt-4">
        <CardHeader>
          <CardTitle className="text-base">Set commit deadline</CardTitle>
          <CardDescription>
            Players will have this duration to join and commit their votes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetCommitDeadline} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commit-duration">Duration (seconds)</Label>
              <Input
                id="commit-duration"
                type="number"
                min="1"
                value={commitDuration}
                onChange={(e) => setCommitDuration(e.target.value)}
                placeholder="300"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommitDuration('60')}
              >
                1 min
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommitDuration('300')}
              >
                5 min
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommitDuration('3600')}
              >
                1 hour
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={!address}>
              Set commit deadline
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Reveal deadline form
  if (canSetRevealDeadline) {
    return (
      <Card className="border-accent/30 mt-4">
        <CardHeader>
          <CardTitle className="text-base">Set reveal deadline</CardTitle>
          <CardDescription>
            Players will have this duration to reveal their votes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetRevealDeadline} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reveal-duration">Duration (seconds)</Label>
              <Input
                id="reveal-duration"
                type="number"
                min="1"
                value={revealDuration}
                onChange={(e) => setRevealDuration(e.target.value)}
                placeholder="180"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRevealDuration('60')}
              >
                1 min
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRevealDuration('300')}
              >
                5 min
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRevealDuration('3600')}
              >
                1 hour
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={!address}>
              Set reveal deadline
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return null;
}
