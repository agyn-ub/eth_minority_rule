'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked, hexToBytes } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';

interface VoteCommitFormProps {
  gameId: number;
  currentRound: number;
}

export function VoteCommitForm({ gameId, currentRound }: VoteCommitFormProps) {
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

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

  return (
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
  );
}
