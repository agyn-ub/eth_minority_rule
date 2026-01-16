import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe query helpers matching Ponder schema

export interface Game {
  game_id: string;               // bigint as string
  question_text: string;
  entry_fee: string;
  creator_address: string;
  state: string;                 // ZeroPhase, CommitPhase, RevealPhase, Completed
  current_round: number;
  total_players: number;
  prize_pool: string;
  commit_deadline?: string;      // bigint as string (nullable)
  reveal_deadline?: string;      // bigint as string (nullable)
  created_at: string;
  updated_at: string;
  block_number: string;          // bigint as string
  transaction_hash: string;
}

export interface Player {
  id: string;                    // Composite: "gameId-playerAddress"
  game_id: string;               // bigint as string
  player_address: string;
  joined_amount: string;
  joined_at: string;
  block_number: string;          // bigint as string
  transaction_hash: string;
}

export interface Vote {
  id: string;                    // Composite: "gameId-round-playerAddress"
  game_id: string;               // bigint as string
  round: number;
  player_address: string;
  vote: boolean;
  revealed_at: string;
  block_number: string;          // bigint as string
  transaction_hash: string;
}

export interface Commit {
  id: string;                    // Composite: "gameId-round-playerAddress"
  game_id: string;               // bigint as string
  round: number;
  player_address: string;
  commit_hash: string;
  committed_at: string;
  block_number: string;          // bigint as string
  transaction_hash: string;
}

export interface Round {
  id: string;                    // Composite: "gameId-round"
  game_id: string;               // bigint as string
  round: number;
  yes_count: number;
  no_count: number;
  minority_vote: boolean;
  remaining_players: number;
  completed_at: string;
  block_number: string;          // bigint as string
  transaction_hash: string;
}

export interface Winner {
  id: string;                    // Composite: "gameId-playerAddress"
  game_id: string;               // bigint as string
  player_address: string;
  prize_amount: string;
  platform_fee: string;
  paid_at: string;
  block_number: string;          // bigint as string
  transaction_hash: string;
}

// Query functions

export const getGame = async (gameId: number | string): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('game_id', gameId.toString())
    .single();

  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }
  return data;
};

export const getActiveGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .in('state', ['ZeroPhase', 'CommitPhase', 'RevealPhase'])
    .order('block_number', { ascending: false });

  if (error) {
    console.error('Error fetching active games:', error);
    return [];
  }
  return data || [];
};

export const getCompletedGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('state', 'Completed')
    .order('block_number', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching completed games:', error);
    return [];
  }
  return data || [];
};

export const getGamePlayers = async (gameId: number | string): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId.toString())
    .order('block_number', { ascending: true });

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }
  return data || [];
};

export const getGameVotes = async (gameId: number | string, round?: number): Promise<Vote[]> => {
  let query = supabase
    .from('votes')
    .select('*')
    .eq('game_id', gameId.toString());

  if (round !== undefined) {
    query = query.eq('round', round);
  }

  const { data, error } = await query.order('block_number', { ascending: true });

  if (error) {
    console.error('Error fetching votes:', error);
    return [];
  }
  return data || [];
};

export const getGameCommits = async (gameId: number | string, round?: number): Promise<Commit[]> => {
  let query = supabase
    .from('commits')
    .select('*')
    .eq('game_id', gameId.toString());

  if (round !== undefined) {
    query = query.eq('round', round);
  }

  const { data, error } = await query.order('block_number', { ascending: true });

  if (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
  return data || [];
};

export const getGameRounds = async (gameId: number | string): Promise<Round[]> => {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('game_id', gameId.toString())
    .order('round', { ascending: true });

  if (error) {
    console.error('Error fetching rounds:', error);
    return [];
  }
  return data || [];
};

export const getGameWinners = async (gameId: number | string): Promise<Winner[]> => {
  const { data, error} = await supabase
    .from('winners')
    .select('*')
    .eq('game_id', gameId.toString());

  if (error) {
    console.error('Error fetching winners:', error);
    return [];
  }
  return data || [];
};

export const getPlayerGames = async (playerAddress: string): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('player_address', playerAddress.toLowerCase())
    .order('block_number', { ascending: false });

  if (error) {
    console.error('Error fetching player games:', error);
    return [];
  }
  return data || [];
};

export const getPlayerWins = async (playerAddress: string): Promise<Winner[]> => {
  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .eq('player_address', playerAddress.toLowerCase())
    .order('block_number', { ascending: false});

  if (error) {
    console.error('Error fetching player wins:', error);
    return [];
  }
  return data || [];
};

export const getMyGames = async (creatorAddress: string): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('creator_address', creatorAddress.toLowerCase())
    .order('block_number', { ascending: false});

  if (error) {
    console.error('Error fetching my games:', error);
    return [];
  }
  return data || [];
};

export const getGameCommitCount = async (gameId: number | string): Promise<number> => {
  const { count, error } = await supabase
    .from('commits')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId.toString());

  if (error) {
    console.error('Error counting commits:', error);
    return 0;
  }

  return count || 0;
};
