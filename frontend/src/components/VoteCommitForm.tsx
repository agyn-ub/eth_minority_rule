'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked, hexToBytes } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import { useGameMutations } from '@/hooks/mutations/use-game-mutations';

interface VoteData {
  vote: boolean;
  salt: string;
  gameId: number;
  round: number;
  address: string;
}

interface VoteCommitFormProps {
  gameId: number;
  currentRound: number;
}

export function VoteCommitForm({ gameId, currentRound }: VoteCommitFormProps) {
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const { invalidateGame } = useGameMutations();
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);
  const [committedVoteData, setCommittedVoteData] = useState<VoteData | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Load committed vote data and invalidate cache when transaction confirms
  useEffect(() => {
    if (isSuccess && address) {
      const storageKey = `vote_salt_${gameId}_${currentRound}_${address}`;
      const data = localStorage.getItem(storageKey);
      if (data) {
        setCommittedVoteData(JSON.parse(data));
      }
      invalidateGame(gameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, gameId, currentRound, address]);

  const handleSubmitCommit = async () => {
    if (selectedVote === null || !chainId) {
      toast({
        title: 'Error',
        description: 'Please select a vote first',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate random salt (32 bytes)
      const saltBytes = crypto.getRandomValues(new Uint8Array(32));
      const salt = `0x${Array.from(saltBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}` as `0x${string}`;

      // Create commit hash: keccak256(abi.encodePacked(vote, salt))
      const commitHash = keccak256(encodePacked(['bool', 'bytes32'], [selectedVote, salt]));

      // Store salt in localStorage (important for reveal phase!)
      const storageKey = `vote_salt_${gameId}_${currentRound}_${address}`;
      const voteData = {
        vote: selectedVote,
        salt,
        gameId,
        round: currentRound,
        address,
      };
      localStorage.setItem(storageKey, JSON.stringify(voteData));

      // Submit commit transaction
      writeContract({
        address: getContractAddress(chainId),
        abi: MinorityRuleGameAbi,
        functionName: 'submitCommit',
        args: [BigInt(gameId), commitHash],
      });

      toast({
        title: 'Commit Submitted',
        description: `Your ${selectedVote ? 'YES' : 'NO'} vote has been committed. Remember to reveal it later!`,
      });
    } catch (error) {
      console.error('Error submitting commit:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit commit. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show loading state while transaction is processing
  if (isPending || isConfirming) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Committing Vote...</CardTitle>
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

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Vote (Commit Phase)</CardTitle>
        <CardDescription>
          Your vote will be hidden until the reveal phase. Make sure to come back to reveal it!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Choose your answer:</Label>
          <div className="flex gap-4 mt-2">
            <Button
              variant={selectedVote === true ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setSelectedVote(true)}
            >
              YES
            </Button>
            <Button
              variant={selectedVote === false ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setSelectedVote(false)}
            >
              NO
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSubmitCommit}
          disabled={selectedVote === null || isPending || isConfirming}
          className="w-full"
        >
          {isPending || isConfirming ? 'Committing...' : 'Commit Vote'}
        </Button>

        <p className="text-xs text-muted-foreground">
          Note: Your vote will be stored securely in your browser. You'll need to reveal it in the
          next phase to have it counted.
        </p>
      </CardContent>
    </Card>

    {isSuccess && committedVoteData && (
      <Card className="border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700">✅ Vote Committed Successfully</CardTitle>
          <CardDescription>
            Save this information to reveal your vote later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Your Vote</Label>
            <p className="font-semibold text-lg">{committedVoteData.vote ? 'YES' : 'NO'}</p>
          </div>

          <div>
            <Label>Your Salt (Save This!)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={committedVoteData.salt}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(committedVoteData.salt);
                  toast({ title: 'Salt copied to clipboard!' });
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ⚠️ You'll need this exact salt to reveal your vote. Save it somewhere safe!
            </p>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> If you lose this salt or clear your browser data,
              you will not be able to reveal your vote!
            </p>
          </div>
        </CardContent>
      </Card>
    )}
    </>
  );
}
