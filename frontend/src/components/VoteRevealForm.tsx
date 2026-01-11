'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';

interface VoteRevealFormProps {
  gameId: number;
  currentRound: number;
}

interface StoredVote {
  vote: boolean;
  salt: `0x${string}`;
  gameId: number;
  round: number;
  address: string;
}

export function VoteRevealForm({ gameId, currentRound }: VoteRevealFormProps) {
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [storedVote, setStoredVote] = useState<StoredVote | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!address) return;

    // Retrieve stored vote from localStorage
    const storageKey = `vote_salt_${gameId}_${currentRound}_${address}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const voteData = JSON.parse(stored) as StoredVote;
        setStoredVote(voteData);
      } catch (error) {
        console.error('Error parsing stored vote:', error);
      }
    }
  }, [address, gameId, currentRound]);

  const handleReveal = async () => {
    if (!storedVote || !chainId) {
      toast({
        title: 'Error',
        description: 'No committed vote found for this game and round',
        variant: 'destructive',
      });
      return;
    }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: MinorityRuleGameAbi,
        functionName: 'submitReveal',
        args: [BigInt(gameId), storedVote.vote, storedVote.salt],
      });

      toast({
        title: 'Vote Revealed',
        description: `Your ${storedVote.vote ? 'YES' : 'NO'} vote has been revealed!`,
      });
    } catch (error) {
      console.error('Error revealing vote:', error);
      toast({
        title: 'Error',
        description: 'Failed to reveal vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!storedVote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reveal Your Vote</CardTitle>
          <CardDescription>No committed vote found for this round</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You haven't committed a vote for this round yet, or your vote data was cleared from this
            browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reveal Your Vote</CardTitle>
        <CardDescription>
          Click below to reveal your committed vote. This will make your vote public on-chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium">Your committed vote:</p>
          <p className="text-2xl font-bold mt-1">{storedVote.vote ? 'YES' : 'NO'}</p>
        </div>

        <Button
          onClick={handleReveal}
          disabled={isPending || isConfirming}
          className="w-full"
        >
          {isPending || isConfirming ? 'Revealing...' : 'Reveal Vote'}
        </Button>

        <p className="text-xs text-muted-foreground">
          After revealing, the smart contract will verify your vote matches your commitment.
        </p>
      </CardContent>
    </Card>
  );
}
