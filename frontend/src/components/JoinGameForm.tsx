'use client';

import { useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import { useGameMutations } from '@/hooks/mutations/use-game-mutations';
import { formatWei } from '@/lib/utils';

interface JoinGameFormProps {
  gameId: number;
  entryFee: string; // in Wei as string
}

export function JoinGameForm({ gameId, entryFee }: JoinGameFormProps) {
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const { invalidateGame } = useGameMutations();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Invalidate cache when transaction confirms
  useEffect(() => {
    if (isSuccess) {
      invalidateGame(gameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, gameId]);

  const handleJoinGame = async () => {
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
        functionName: 'joinGame',
        args: [BigInt(gameId)],
        value: BigInt(entryFee), // Send ETH equal to entry fee
      });

      toast({
        title: 'Joining Game',
        description: `Sending ${formatWei(entryFee)} ETH to join the game...`,
      });
    } catch (error) {
      console.error('Error joining game:', error);
      toast({
        title: 'Error',
        description: 'Failed to join game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show loading state while transaction is processing
  if (isPending || isConfirming) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Joining Game...</CardTitle>
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
          <CardTitle className="text-green-700">✅ Joined Successfully!</CardTitle>
          <CardDescription>You're now in the game</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your entry fee has been added to the prize pool. Good luck!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join This Game</CardTitle>
        <CardDescription>
          Pay the entry fee to join and compete for the prize pool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">Entry Fee</p>
          <p className="text-3xl font-bold">{formatWei(entryFee)} ETH</p>
        </div>

        <Button
          onClick={handleJoinGame}
          disabled={!address || isPending || isConfirming}
          className="w-full"
          size="lg"
        >
          {isPending || isConfirming ? 'Joining...' : 'Join Game'}
        </Button>

        <p className="text-xs text-muted-foreground">
          You'll need to confirm this transaction in your wallet. The entry fee will be added to
          the prize pool.
        </p>
      </CardContent>
    </Card>
  );
}
