import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe query helpers matching Ponder schema

export interface Game {
  id: string;                    // bigint as string
  questionText: string;
  entryFee: string;
  creatorAddress: string;
  state: string;                 // ZeroPhase, CommitPhase, RevealPhase, Completed
  currentRound: number;
  totalPlayers: number;
  prizePool: string;
  commitDeadline?: string;       // bigint as string (nullable)
  revealDeadline?: string;       // bigint as string (nullable)
  blockNumber: string;           // bigint as string
  transactionHash: string;
}

export interface Player {
  id: string;                    // Composite: "gameId-playerAddress"
  gameId: string;                // bigint as string
  playerAddress: string;
  joinedAmount: string;
  blockNumber: string;           // bigint as string
  transactionHash: string;
}

export interface Vote {
  id: string;                    // Composite: "gameId-round-playerAddress"
  gameId: string;                // bigint as string
  round: number;
  playerAddress: string;
  vote: boolean;
  blockNumber: string;           // bigint as string
  transactionHash: string;
}

export interface Commit {
  id: string;                    // Composite: "gameId-round-playerAddress"
  gameId: string;                // bigint as string
  round: number;
  playerAddress: string;
  commitHash: string;
  blockNumber: string;           // bigint as string
  transactionHash: string;
}

export interface Round {
  id: string;                    // Composite: "gameId-round"
  gameId: string;                // bigint as string
  round: number;
  yesCount: number;
  noCount: number;
  minorityVote: boolean;
  remainingPlayers: number;
  blockNumber: string;           // bigint as string
  transactionHash: string;
}

export interface Winner {
  id: string;                    // Composite: "gameId-playerAddress"
  gameId: string;                // bigint as string
  playerAddress: string;
  prizeAmount: string;
  platformFee: string;
  blockNumber: string;           // bigint as string
  transactionHash: string;
}

// Query functions

export const getGame = async (gameId: number | string): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('Game')
    .select('*')
    .eq('id', gameId.toString())
    .single();

  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }
  return data;
};

export const getActiveGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('Game')
    .select('*')
    .in('state', ['ZeroPhase', 'CommitPhase', 'RevealPhase'])
    .order('blockNumber', { ascending: false });

  if (error) {
    console.error('Error fetching active games:', error);
    return [];
  }
  return data || [];
};

export const getCompletedGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('Game')
    .select('*')
    .eq('state', 'Completed')
    .order('blockNumber', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching completed games:', error);
    return [];
  }
  return data || [];
};

export const getGamePlayers = async (gameId: number | string): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .eq('gameId', gameId.toString())
    .order('blockNumber', { ascending: true });

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }
  return data || [];
};

export const getGameVotes = async (gameId: number | string, round?: number): Promise<Vote[]> => {
  let query = supabase
    .from('Vote')
    .select('*')
    .eq('gameId', gameId.toString());

  if (round !== undefined) {
    query = query.eq('round', round);
  }

  const { data, error } = await query.order('blockNumber', { ascending: true });

  if (error) {
    console.error('Error fetching votes:', error);
    return [];
  }
  return data || [];
};

export const getGameCommits = async (gameId: number | string, round?: number): Promise<Commit[]> => {
  let query = supabase
    .from('Commit')
    .select('*')
    .eq('gameId', gameId.toString());

  if (round !== undefined) {
    query = query.eq('round', round);
  }

  const { data, error } = await query.order('blockNumber', { ascending: true });

  if (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
  return data || [];
};

export const getGameRounds = async (gameId: number | string): Promise<Round[]> => {
  const { data, error } = await supabase
    .from('Round')
    .select('*')
    .eq('gameId', gameId.toString())
    .order('round', { ascending: true });

  if (error) {
    console.error('Error fetching rounds:', error);
    return [];
  }
  return data || [];
};

export const getGameWinners = async (gameId: number | string): Promise<Winner[]> => {
  const { data, error} = await supabase
    .from('Winner')
    .select('*')
    .eq('gameId', gameId.toString());

  if (error) {
    console.error('Error fetching winners:', error);
    return [];
  }
  return data || [];
};

export const getPlayerGames = async (playerAddress: string): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .eq('playerAddress', playerAddress.toLowerCase())
    .order('blockNumber', { ascending: false });

  if (error) {
    console.error('Error fetching player games:', error);
    return [];
  }
  return data || [];
};

export const getPlayerWins = async (playerAddress: string): Promise<Winner[]> => {
  const { data, error } = await supabase
    .from('Winner')
    .select('*')
    .eq('playerAddress', playerAddress.toLowerCase())
    .order('blockNumber', { ascending: false});

  if (error) {
    console.error('Error fetching player wins:', error);
    return [];
  }
  return data || [];
};
