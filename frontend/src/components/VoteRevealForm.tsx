'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

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
  const [manualVote, setManualVote] = useState<boolean | null>(null);
  const [manualSalt, setManualSalt] = useState<string>('');
  const [useManualInput, setUseManualInput] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: chainId as any });

  // Show success toast when transaction confirms
  // Let polling naturally update the UI
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Vote Revealed Successfully!',
        description: 'Your vote will appear in the game shortly once indexed.',
      });
    }
  }, [isSuccess, toast]);

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

  const validateSalt = (salt: string): boolean => {
    // Must be 66 characters (0x + 64 hex chars)
    if (!salt.startsWith('0x') || salt.length !== 66) {
      toast({
        title: 'Invalid Salt Format',
        description: 'Salt must be a 66-character hex string starting with 0x',
        variant: 'destructive',
      });
      return false;
    }

    // Must be valid hex
    if (!/^0x[0-9a-fA-F]{64}$/.test(salt)) {
      toast({
        title: 'Invalid Salt',
        description: 'Salt contains invalid characters. Must be hexadecimal.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

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

    // Validate salt format if using manual input
    if (useManualInput && manualSalt && !validateSalt(manualSalt)) {
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
      } else if (errorMessage.includes('InvalidReveal') || errorMessage.includes('invalid reveal')) {
        toast({
          title: 'Invalid Reveal',
          description: 'The salt or vote doesn\'t match your commitment. Please check your saved salt.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage.length > 100 ? 'Failed to reveal vote. Please try again.' : errorMessage,
          variant: 'destructive',
        });
      }
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
      <Card className="border-success/50 bg-success/10">
        <CardHeader>
          <CardTitle className="text-success">✅ Vote Revealed Successfully!</CardTitle>
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
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>Reveal Your Vote</CardTitle>
          <CardDescription>No committed vote found for this round</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Missing Salt Warning */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-500">Salt not found in browser storage</h4>
                  <p className="text-sm text-muted-foreground">
                    Your vote salt was not found. This might happen if you:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Cleared your browser data</li>
                    <li>• Used a different browser/device</li>
                    <li>• Are in private/incognito mode</li>
                  </ul>
                  <p className="text-sm font-semibold mt-2">
                    Enter your salt manually below (you should have saved this when committing).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry Form */}
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
            <Label htmlFor="salt">Your secret salt</Label>
            <Input
              id="salt"
              value={manualSalt}
              onChange={(e) => {
                setManualSalt(e.target.value);
                setUseManualInput(true);
              }}
              placeholder="0x..."
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              66-character hex string (0x followed by 64 characters). Should match the salt you saved when committing.
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
