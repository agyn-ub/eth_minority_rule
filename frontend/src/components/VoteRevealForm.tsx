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
  const { invalidateGame } = useGameMutations();
  const [storedVote, setStoredVote] = useState<StoredVote | null>(null);
  const [manualVote, setManualVote] = useState<boolean | null>(null);
  const [manualSalt, setManualSalt] = useState<string>('');
  const [useManualInput, setUseManualInput] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Invalidate cache when transaction confirms
  useEffect(() => {
    if (isSuccess) {
      invalidateGame(gameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, gameId]);

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
    if (!chainId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    // Determine which data to use (stored or manual)
    const voteToReveal = useManualInput && manualVote !== null && manualSalt
      ? { vote: manualVote, salt: manualSalt as `0x${string}` }
      : storedVote;

    if (!voteToReveal) {
      toast({
        title: 'Error',
        description: 'No vote data available. Please enter your vote and salt manually.',
        variant: 'destructive',
      });
      return;
    }

    try {
      writeContract({
        address: getContractAddress(chainId),
        abi: MinorityRuleGameAbi,
        functionName: 'submitReveal',
        args: [BigInt(gameId), voteToReveal.vote, voteToReveal.salt],
      });

      toast({
        title: 'Vote Revealed',
        description: `Your ${voteToReveal.vote ? 'YES' : 'NO'} vote has been revealed!`,
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

  // Show loading state while transaction is processing
  if (isPending || isConfirming) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revealing Vote...</CardTitle>
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
          <CardTitle className="text-green-700">✅ Vote Revealed Successfully!</CardTitle>
          <CardDescription>Your vote is now public</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The smart contract has verified your vote matches your commitment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!storedVote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reveal Your Vote</CardTitle>
          <CardDescription>No committed vote found for this round</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-yellow-600">
            ⚠️ Vote data not found in browser storage. If you saved your vote and salt, you can manually enter them below:
          </p>

          <div className="space-y-2">
            <Label>Your Vote</Label>
            <div className="flex gap-2">
              <Button
                variant={manualVote === true ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setManualVote(true)}
              >
                YES
              </Button>
              <Button
                variant={manualVote === false ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setManualVote(false)}
              >
                NO
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your Salt</Label>
            <Input
              value={manualSalt}
              onChange={(e) => {
                setManualSalt(e.target.value);
                setUseManualInput(true);
              }}
              placeholder="0x..."
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Enter the salt you saved when committing your vote.
            </p>
          </div>

          <Button
            onClick={handleReveal}
            disabled={manualVote === null || !manualSalt || isPending || isConfirming}
            className="w-full"
          >
            {isPending || isConfirming ? 'Revealing...' : 'Reveal Vote'}
          </Button>
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
        <div className="space-y-2">
          <Label>Your Committed Vote</Label>
          <p className="text-2xl font-bold">{storedVote.vote ? 'YES' : 'NO'}</p>
        </div>

        <div className="space-y-2">
          <Label>Your Salt</Label>
          <div className="flex gap-2">
            <Input
              value={storedVote.salt}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(storedVote.salt);
                toast({ title: 'Salt copied!' });
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This salt was automatically saved when you committed your vote.
          </p>
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
