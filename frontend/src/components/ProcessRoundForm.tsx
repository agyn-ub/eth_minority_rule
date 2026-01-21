'use client';

import { useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import { useGameMutations } from '@/hooks/mutations/use-game-mutations';

interface ProcessRoundFormProps {
  gameId: number;
}

export function ProcessRoundForm({ gameId }: ProcessRoundFormProps) {
  const { chainId } = useAccount();
  const { toast } = useToast();
  const { invalidateAfterProcessRound } = useGameMutations();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Invalidate game data on success (detail + rounds + eliminations + winners)
  useEffect(() => {
    if (isSuccess) {
      invalidateAfterProcessRound(gameId);
      toast({
        title: 'Round Processed',
        description: 'The round has been completed. Check the results below.',
      });
    }
  }, [isSuccess, gameId, invalidateAfterProcessRound, toast]);

  const handleProcessRound = async () => {
    if (!chainId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: MinorityRuleGameAbi,
        functionName: 'processRound',
        args: [BigInt(gameId)],
      });
    } catch (error) {
      console.error('Error processing round:', error);
      handleError(error);
    }
  };

  const handleError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('NotInRevealPhaseForProcessing')) {
      toast({
        title: 'Error',
        description: 'Game is not in reveal phase',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('DeadlineNotPassedOrNotAllRevealed')) {
      toast({
        title: 'Error',
        description: 'Reveal deadline has not passed and not all players have revealed',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('insufficient funds')) {
      toast({
        title: 'Insufficient Funds',
        description: "You don't have enough ETH for gas fees",
        variant: 'destructive',
      });
    } else if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
      toast({
        title: 'Transaction Cancelled',
        description: 'You cancelled the transaction',
      });
    } else {
      toast({
        title: 'Error',
        description: errorMessage.length > 100 ? 'Failed to process round. Please try again.' : errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Show loading state
  if (isPending || isConfirming) {
    return (
      <Card className="border-accent/50">
        <CardHeader>
          <CardTitle>Processing Round...</CardTitle>
          <CardDescription>
            {isPending && 'Please confirm the transaction in your wallet'}
            {isConfirming && 'Waiting for blockchain confirmation...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <Card className="border-success/50 bg-success/10">
        <CardHeader>
          <CardTitle className="text-success">✅ Round Processed Successfully!</CardTitle>
          <CardDescription>
            The round results have been calculated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check the round history and game status below to see the results.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Main button state
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-accent to-primary"></div>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-primary"></div>
          <CardTitle className="text-lg font-bold tracking-normal">
            Ready to <span className="text-primary">process round</span>
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          The reveal phase has ended. Process this round to determine winners and continue the game.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center border-l-4 border-accent pl-4">
          <p className="text-base font-semibold">
            Anyone can process the round - it's permissionless!
          </p>
        </div>

        <Button
          onClick={handleProcessRound}
          variant="gradient"
          size="lg"
          className="w-full h-16 text-base"
        >
          ⚡ Process Round
        </Button>

        <div className="p-5 bg-black/30 border-l-4 border-accent rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-xl">ℹ️</div>
            <div>
              <p className="text-xs font-semibold text-accent mb-1 tracking-normal">What happens next?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The smart contract will calculate who voted in the minority. If 2+ players remain,
                the game continues to the next round. If only 1 player remains, they win the prize pool!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
