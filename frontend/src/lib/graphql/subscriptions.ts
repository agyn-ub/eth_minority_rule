import { gql } from 'urql';

// Real-time game updates
export const GAME_UPDATED = gql`
  subscription GameUpdated($gameId: String!) {
    game(id: $gameId) {
      id
      game_id
      state
      current_round
      total_players
      prize_pool
      commit_deadline
      reveal_deadline
      updated_at
    }
  }
`;

// Real-time vote reveals
export const VOTE_REVEALED = gql`
  subscription VoteRevealed($gameId: String!, $round: Int!) {
    votes(
      where: {
        game_id: $gameId
        round: $round
      }
    ) {
      items {
        id
        player_address
        vote
        revealed_at
      }
    }
  }
`;

// Real-time commits
export const COMMIT_SUBMITTED = gql`
  subscription CommitSubmitted($gameId: String!, $round: Int!) {
    commits(
      where: {
        game_id: $gameId
        round: $round
      }
    ) {
      items {
        id
        player_address
        committed_at
      }
    }
  }
`;

// New players joining
export const PLAYER_JOINED = gql`
  subscription PlayerJoined($gameId: String!) {
    players(
      where: { game_id: $gameId }
    ) {
      items {
        id
        player_address
        joined_at
      }
    }
  }
`;
