'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_MY_GAMES } from '@/lib/graphql/queries';

interface GameItem {
  game_id: string;
  question_text: string;
  entry_fee: string;
  creator_address: string;
  state: string;
  current_round: number;
  total_players: number;
  prize_pool: string;
  commit_deadline?: string;
  reveal_deadline?: string;
  created_at: string;
  updated_at: string;
  block_number: string;
  transaction_hash: string;
}

interface MyGamesResponse {
  gamess: {
    items: GameItem[];
  };
}

export function useMyGames() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['my-games', address?.toLowerCase()],
    queryFn: async () => {
      if (!address) throw new Error('Not connected');
      const data = await graphqlRequest<MyGamesResponse, { creatorAddress: string }>(
        GET_MY_GAMES,
        { creatorAddress: address.toLowerCase() }
      );
      return data.gamess.items;
    },
    enabled: !!address,
    refetchInterval: 300_000,
    refetchIntervalInBackground: false,
    placeholderData: (prev) => prev,
  });
}
