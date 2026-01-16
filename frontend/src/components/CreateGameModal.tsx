'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getContractAddress, MinorityRuleGameAbi } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';

interface CreateGameModalProps {
  trigger: React.ReactNode;
}

export function CreateGameModal({ trigger }: CreateGameModalProps) {
  const queryClient = useQueryClient();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const { switchChain } = useSwitchChain();

  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [entryFee, setEntryFee] = useState('0.01');

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if current chain is supported
  const supportedChains = [31337, 84532, 8453]; // Anvil, Base Sepolia, Base Mainnet
  const isChainSupported = chainId ? supportedChains.includes(chainId) : false;

  // Show toast only after MetaMask confirms (when blockchain is confirming)
  useEffect(() => {
    if (hash && isConfirming) {
      toast({
        title: 'Creating Game',
        description: 'Waiting for blockchain confirmation...',
        duration: 10000,
      });
    }
  }, [hash, isConfirming, toast]);

  // Handle success - auto-close modal and refetch games
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setOpen(false);
        // Reset form state
        setQuestionText('');
        setEntryFee('0.01');
        reset();
        // Refetch games list
        queryClient.invalidateQueries({ queryKey: ['games'] });
      }, 2000);
    }
  }, [isSuccess, queryClient, reset]);

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

    if (!isChainSupported) {
      toast({
        title: 'Wrong Network',
        description: 'Please switch to Anvil (localhost), Base Sepolia, or Base Mainnet',
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
    } catch (error) {
      console.error('Error creating game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create game. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {/* Loading State */}
        {(isPending || isConfirming) && (
          <>
            <DialogHeader>
              <DialogTitle>Creating game...</DialogTitle>
              <DialogDescription>
                {isPending && 'Please confirm the transaction in MetaMask'}
                {isConfirming && 'Waiting for blockchain confirmation...'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </>
        )}

        {/* Success State */}
        {isSuccess && (
          <>
            <DialogHeader>
              <DialogTitle>Game created successfully!</DialogTitle>
              <DialogDescription>Your game has been created on-chain.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Players can now join your game! The modal will close automatically.
              </p>
            </div>
          </>
        )}

        {/* Form State */}
        {!isPending && !isConfirming && !isSuccess && (
          <>
            <DialogHeader>
              <DialogTitle>Create new game</DialogTitle>
              <DialogDescription>
                Set up a new Minority Rule game with a yes/no question
              </DialogDescription>
            </DialogHeader>

            {/* Wrong Network Warning */}
            {address && chainId && !isChainSupported && (
              <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-md space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-destructive">Wrong Network</h4>
                  <p className="text-sm text-muted-foreground">
                    You're connected to chain ID {chainId}. Please switch to one of the supported networks:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Anvil (Local) - Chain ID 31337</li>
                    <li>• Base Sepolia - Chain ID 84532</li>
                    <li>• Base Mainnet - Chain ID 8453</li>
                  </ul>
                </div>
                <Button
                  type="button"
                  onClick={() => switchChain({ chainId: 31337 })}
                  variant="outline"
                  className="w-full"
                >
                  Switch to Anvil (Localhost)
                </Button>
              </div>
            )}

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
                <Label htmlFor="entryFee">Entry fee (ETH)</Label>
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
                <h4 className="font-semibold text-sm">How it works:</h4>
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
                disabled={!address || !isChainSupported || isPending || isConfirming}
                className="w-full"
                size="lg"
              >
                {isPending || isConfirming ? 'Creating game...' : 'Create game'}
              </Button>

              {!address && (
                <p className="text-sm text-center text-muted-foreground">
                  Please connect your wallet to create a game
                </p>
              )}

              {address && !isChainSupported && (
                <p className="text-sm text-center text-destructive">
                  Please switch to a supported network to create a game
                </p>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
