'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';

export default function CreateGamePage() {
  const router = useRouter();
  const { address, chainId } = useAccount();
  const { toast } = useToast();

  const [questionText, setQuestionText] = useState('');
  const [entryFee, setEntryFee] = useState('0.01');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    if (!entryFee || Number(entryFee) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid entry fee',
        variant: 'destructive',
      });
      return;
    }

    if (!chainId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      const entryFeeWei = parseEther(entryFee);

      writeContract({
        address: getContractAddress(chainId),
        abi: MinorityRuleGameAbi,
        functionName: 'createGame',
        args: [questionText, entryFeeWei],
      });

      toast({
        title: 'Creating Game',
        description: 'Your transaction has been submitted',
      });
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      router.push('/');
    }, 2000);

    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Game Created Successfully!</CardTitle>
            <CardDescription>Redirecting you to the games page...</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your game has been created on-chain. Players can now join!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Create New Game</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new Minority Rule game with a yes/no question
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Details</CardTitle>
          <CardDescription>
            Players will vote on your question. Only the minority advances each round!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGame} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question (Yes/No)</Label>
              <Input
                id="question"
                placeholder="e.g., Will ETH reach $10,000 this year?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {questionText.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee (ETH)</Label>
              <Input
                id="entryFee"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.01"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Players must pay this amount to join the game
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md space-y-2">
              <h4 className="font-semibold text-sm">How It Works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Players join during Round 1 by paying the entry fee</li>
                <li>2. You (the creator) set deadlines for commit and reveal phases</li>
                <li>3. Players commit their votes (YES or NO)</li>
                <li>4. Players reveal their votes</li>
                <li>5. Only the minority advances to the next round</li>
                <li>6. Game continues until 1-2 players remain</li>
                <li>7. Winners split the prize pool (minus 2% platform fee)</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={!address || isPending || isConfirming}
              className="w-full"
              size="lg"
            >
              {isPending || isConfirming ? 'Creating Game...' : 'Create Game'}
            </Button>

            {!address && (
              <p className="text-sm text-center text-muted-foreground">
                Please connect your wallet to create a game
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
