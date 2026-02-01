'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Info } from 'lucide-react';

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
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);
  const [committedVoteData, setCommittedVoteData] = useState<VoteData | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Load committed vote data when transaction confirms
  // Let polling naturally update the UI (no cache invalidation needed)
  useEffect(() => {
    if (isSuccess && address) {
      const storageKey = `vote_salt_${gameId}_${currentRound}_${address}`;
      const data = localStorage.getItem(storageKey);
      if (data) {
        setCommittedVoteData(JSON.parse(data));
      }
      toast({
        title: 'Vote Committed Successfully!',
        description: 'Your vote will appear in the game shortly once indexed.',
      });
    }
  }, [isSuccess, gameId, currentRound, address, toast]);

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

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Specific error messages
      if (errorMessage.includes('insufficient funds')) {
        toast({
          title: 'Insufficient Funds',
          description: 'You don\'t have enough ETH to complete this transaction.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
        toast({
          title: 'Transaction Cancelled',
          description: 'You cancelled the transaction in MetaMask.',
        });
      } else if (errorMessage.includes('nonce')) {
        toast({
          title: 'Transaction Error',
          description: 'Transaction failed due to nonce issue. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage.length > 100 ? 'Failed to submit commit. Please try again.' : errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const downloadSalt = () => {
    if (!committedVoteData) return;
    const content = `Minority Rule Game - Vote Salt

Game ID: ${committedVoteData.gameId}
Round: ${committedVoteData.round}
Your Vote: ${committedVoteData.vote ? 'YES' : 'NO'}
Your Salt: ${committedVoteData.salt}
Address: ${committedVoteData.address}

⚠️ IMPORTANT: You need this salt to reveal your vote!
Keep this file safe and come back to reveal your vote during the reveal phase.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-salt-game${committedVoteData.gameId}-round${committedVoteData.round}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show loading state while transaction is processing
  if (isPending || isConfirming) {
    return (
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Committing Vote...</CardTitle>
          <CardDescription>
            {isPending && '⏳ Please confirm the transaction in your wallet'}
            {isConfirming && '⏳ Waiting for blockchain confirmation...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  // Show success state with salt backup
  if (isSuccess && committedVoteData) {
    return (
      <Card className="border-success/50 bg-success/10">
        <CardHeader>
          <CardTitle className="text-success">✅ Vote Committed Successfully!</CardTitle>
          <CardDescription>
            Your {committedVoteData.vote ? 'YES' : 'NO'} vote is encrypted on-chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Salt Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-destructive">
              ⚠️ Save your secret salt (required to reveal)
            </Label>
            <div className="flex gap-2">
              <Input
                value={committedVoteData.salt}
                readOnly
                className="font-mono text-xs bg-background/50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(committedVoteData.salt);
                  toast({ title: 'Salt copied to clipboard' });
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadSalt}
              className="flex-1"
            >
              Download Backup
            </Button>
            <Button
              onClick={() => setCommittedVoteData(null)}
              className="flex-1"
            >
              Done
            </Button>
          </div>

          {/* Compact Warning */}
          <p className="text-xs text-muted-foreground">
            Your salt is saved in browser storage, but download a backup to be safe.
            Without it, you cannot reveal your vote.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Main vote selection interface
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-accent to-primary"></div>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-primary"></div>
          <CardTitle className="text-lg font-bold tracking-normal">
            Cast your <span className="text-primary">vote</span>
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          Encrypted and hidden on blockchain until reveal phase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center border-l-4 border-accent pl-4">
          <p className="text-base font-semibold">Choose wisely. Trust no one.</p>
        </div>

        {/* Large Vote Button Cards - Dramatic Liar Game Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* YES Button */}
          <button
            onClick={() => setSelectedVote(true)}
            className={`
              relative p-10 rounded-lg border-2 transition-colors group
              ${selectedVote === true
                ? 'border-success bg-gradient-to-br from-success/20 to-success/5'
                : 'border-border/50 bg-card hover:border-success/50 hover:bg-success/5'
              }
            `}
          >
            <div className="text-center space-y-4">
              {selectedVote === true && (
                <div className="absolute top-4 right-4 text-success text-xl font-bold">✓</div>
              )}
              <div className="text-5xl">👍</div>
              <div className="text-xl font-bold text-foreground uppercase tracking-normal">YES</div>
              <div className="h-1 w-16 bg-success mx-auto"></div>
            </div>
          </button>

          {/* NO Button */}
          <button
            onClick={() => setSelectedVote(false)}
            className={`
              relative p-10 rounded-lg border-2 transition-colors group
              ${selectedVote === false
                ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5'
                : 'border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5'
              }
            `}
          >
            <div className="text-center space-y-4">
              {selectedVote === false && (
                <div className="absolute top-4 right-4 text-primary text-xl font-bold">✓</div>
              )}
              <div className="text-5xl">👎</div>
              <div className="text-xl font-bold text-foreground uppercase tracking-normal">NO</div>
              <div className="h-1 w-16 bg-primary mx-auto"></div>
            </div>
          </button>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitCommit}
          disabled={selectedVote === null}
          variant="gradient"
          size="lg"
          className="w-full h-16 text-base"
        >
          {selectedVote === null ? '⚠ Select Your Vote First' : `⚡ Commit ${selectedVote ? 'YES' : 'NO'} Vote`}
        </Button>

        {/* Info Box */}
        <div className="p-5 bg-black/30 border-l-4 border-accent rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-xl">🔐</div>
            <div>
              <p className="text-xs font-semibold text-accent mb-1 tracking-normal">Cryptographic commitment</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your vote will be encrypted with a random salt. Save the salt to reveal later.
                Nobody can see your vote until you reveal it!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
