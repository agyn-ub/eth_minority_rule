import { gql } from 'urql';

// Games list with pagination (cursor-based)
export const GET_ACTIVE_GAMES = gql`
  query GetActiveGames($limit: Int!, $after: String) {
    gamess(
      where: {
        state_in: ["ZeroPhase", "CommitPhase", "RevealPhase"]
      }
      limit: $limit
      after: $after
      orderBy: "block_number"
      orderDirection: "desc"
    ) {
      items {
        game_id
        question_text
        entry_fee
        creator_address
        state
        current_round
        total_players
        prize_pool
        commit_deadline
        reveal_deadline
        created_at
        updated_at
        block_number
        transaction_hash
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_COMPLETED_GAMES = gql`
  query GetCompletedGames($limit: Int!, $after: String) {
    gamess(
      where: { state: "Completed" }
      limit: $limit
      after: $after
      orderBy: "block_number"
      orderDirection: "desc"
    ) {
      items {
        game_id
        question_text
        entry_fee
        creator_address
        state
        current_round
        total_players
        prize_pool
        created_at
        block_number
        transaction_hash
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Games created by a specific address
export const GET_MY_GAMES = gql`
  query GetMyGames($creatorAddress: String!) {
    gamess(
      where: { creator_address: $creatorAddress }
      orderBy: "block_number"
      orderDirection: "desc"
    ) {
      items {
        game_id
        question_text
        entry_fee
        creator_address
        state
        current_round
        total_players
        prize_pool
        commit_deadline
        reveal_deadline
        created_at
        updated_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Single game detail
export const GET_GAME = gql`
  query GetGame($gameId: BigInt!) {
    games(game_id: $gameId) {
      game_id
      question_text
      entry_fee
      creator_address
      state
      current_round
      total_players
      prize_pool
      commit_deadline
      reveal_deadline
      created_at
      updated_at
      block_number
      transaction_hash
    }
  }
`;

// Nested query - game with players
export const GET_GAME_WITH_PLAYERS = gql`
  query GetGameWithPlayers($gameId: BigInt!) {
    games(game_id: $gameId) {
      game_id
      question_text
      state
      current_round
      total_players
      prize_pool
      commit_deadline
      reveal_deadline

      # Nested! One query for all data
      playerss(orderBy: "block_number") {
        items {
          game_id
          player_address
          joined_amount
          joined_at
          block_number
        }
      }
    }
  }
`;

// Votes filtered by round
export const GET_GAME_VOTES = gql`
  query GetGameVotes($gameId: BigInt!, $round: Int) {
    votess(
      where: {
        game_id: $gameId
        round: $round
      }
      orderBy: "block_number"
    ) {
      items {
        game_id
        round
        player_address
        vote
        revealed_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Commits filtered by round
export const GET_GAME_COMMITS = gql`
  query GetGameCommits($gameId: BigInt!, $round: Int) {
    commitss(
      where: {
        game_id: $gameId
        round: $round
      }
      orderBy: "block_number"
    ) {
      items {
        game_id
        round
        player_address
        commit_hash
        committed_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Players for a game
export const GET_GAME_PLAYERS = gql`
  query GetGamePlayers($gameId: BigInt!) {
    playerss(
      where: { game_id: $gameId }
      orderBy: "block_number"
    ) {
      items {
        game_id
        player_address
        joined_amount
        joined_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Rounds for a game
export const GET_GAME_ROUNDS = gql`
  query GetGameRounds($gameId: BigInt!) {
    roundss(
      where: { game_id: $gameId }
      orderBy: "round"
    ) {
      items {
        game_id
        round
        yes_count
        no_count
        minority_vote
        remaining_players
        completed_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Winners for a game
export const GET_GAME_WINNERS = gql`
  query GetGameWinners($gameId: BigInt!) {
    winnerss(
      where: { game_id: $gameId }
    ) {
      items {
        game_id
        player_address
        prize_amount
        platform_fee
        creator_fee
        paid_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Eliminations for a game
export const GET_GAME_ELIMINATIONS = gql`
  query GetGameEliminations($gameId: BigInt!) {
    eliminationss(
      where: { game_id: $gameId }
    ) {
      items {
        game_id
        player_address
        eliminated
        eliminated_round
      }
    }
  }
`;

// All games a player participated in
export const GET_PLAYER_GAMES = gql`
  query GetPlayerGames($playerAddress: String!) {
    playerss(
      where: { player_address: $playerAddress }
      orderBy: "block_number"
      orderDirection: "desc"
    ) {
      items {
        game_id
        player_address
        joined_amount
        joined_at
        block_number
        transaction_hash
      }
    }
  }
`;

// All wins for a player
export const GET_PLAYER_WINS = gql`
  query GetPlayerWins($playerAddress: String!) {
    winnerss(
      where: { player_address: $playerAddress }
      orderBy: "block_number"
      orderDirection: "desc"
    ) {
      items {
        game_id
        player_address
        prize_amount
        platform_fee
        creator_fee
        paid_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Batch: multiple games by IDs
export const GET_GAMES_BY_IDS = gql`
  query GetGamesByIds($gameIds: [BigInt!]!) {
    gamess(
      where: { game_id_in: $gameIds }
    ) {
      items {
        game_id
        question_text
        entry_fee
        creator_address
        state
        current_round
        total_players
        prize_pool
        commit_deadline
        reveal_deadline
        created_at
        updated_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Batch: player votes across multiple games
export const GET_PLAYER_VOTES_FOR_GAMES = gql`
  query GetPlayerVotesForGames($playerAddress: String!, $gameIds: [BigInt!]!) {
    votess(
      where: { player_address: $playerAddress, game_id_in: $gameIds }
      orderBy: "round"
    ) {
      items {
        game_id
        round
        player_address
        vote
        revealed_at
        block_number
        transaction_hash
      }
    }
  }
`;

// Batch: rounds for multiple games
export const GET_ROUNDS_FOR_GAMES = gql`
  query GetRoundsForGames($gameIds: [BigInt!]!) {
    roundss(
      where: { game_id_in: $gameIds }
      orderBy: "round"
    ) {
      items {
        game_id
        round
        yes_count
        no_count
        minority_vote
        remaining_players
        completed_at
        block_number
        transaction_hash
      }
    }
  }
`;

// All player entries (for players leaderboard)
export const GET_ALL_PLAYERS = gql`
  query GetAllPlayers {
    playerss(limit: 1000, orderBy: "block_number", orderDirection: "desc") {
      items {
        game_id
        player_address
        joined_at
        block_number
      }
    }
  }
`;

// All winner entries (for players leaderboard)
export const GET_ALL_WINNERS = gql`
  query GetAllWinners {
    winnerss(limit: 1000) {
      items {
        game_id
        player_address
        prize_amount
      }
    }
  }
`;

// Batch: player wins for specific games
export const GET_PLAYER_WINS_FOR_GAMES = gql`
  query GetPlayerWinsForGames($playerAddress: String!, $gameIds: [BigInt!]!) {
    winnerss(
      where: { player_address: $playerAddress, game_id_in: $gameIds }
    ) {
      items {
        game_id
        player_address
        prize_amount
        platform_fee
        creator_fee
        paid_at
        block_number
        transaction_hash
      }
    }
  }
`;
