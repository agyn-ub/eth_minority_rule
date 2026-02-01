// Test GraphQL queries
const GRAPHQL_URL = 'http://localhost:42069/graphql';

async function testQuery(name, query, variables) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`Variables:`, JSON.stringify(variables, null, 2));

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors) {
      console.log('❌ ERRORS:', JSON.stringify(result.errors, null, 2));
      return false;
    }

    console.log('✅ SUCCESS');
    console.log('Data:', JSON.stringify(result.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    return false;
  }
}

async function runTests() {
  const gameId = '21'; // Test with game ID 21

  // Test 1: GET_GAME
  await testQuery(
    'GET_GAME',
    `query GetGame($gameId: BigInt!) {
      games(game_id: $gameId) {
        game_id
        state
        current_round
        total_players
      }
    }`,
    { gameId }
  );

  // Test 2: GET_GAME_PLAYERS
  await testQuery(
    'GET_GAME_PLAYERS',
    `query GetGamePlayers($gameId: BigInt!) {
      playerss(where: { game_id: $gameId }, orderBy: "block_number") {
        items {
          game_id
          player_address
        }
      }
    }`,
    { gameId }
  );

  // Test 3: GET_GAME_COMMITS (no round)
  await testQuery(
    'GET_GAME_COMMITS (no round)',
    `query GetGameCommits($gameId: BigInt!, $round: Int) {
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
        }
      }
    }`,
    { gameId } // Note: round is not passed
  );

  // Test 4: GET_GAME_COMMITS (with round)
  await testQuery(
    'GET_GAME_COMMITS (with round 1)',
    `query GetGameCommits($gameId: BigInt!, $round: Int) {
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
        }
      }
    }`,
    { gameId, round: 1 }
  );

  // Test 5: GET_GAME_VOTES (no round)
  await testQuery(
    'GET_GAME_VOTES (no round)',
    `query GetGameVotes($gameId: BigInt!, $round: Int) {
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
        }
      }
    }`,
    { gameId }
  );

  // Test 6: GET_GAME_ROUNDS
  await testQuery(
    'GET_GAME_ROUNDS',
    `query GetGameRounds($gameId: BigInt!) {
      roundss(where: { game_id: $gameId }, orderBy: "round") {
        items {
          game_id
          round
          yes_count
          no_count
        }
      }
    }`,
    { gameId }
  );

  // Test 7: GET_GAME_WINNERS
  await testQuery(
    'GET_GAME_WINNERS',
    `query GetGameWinners($gameId: BigInt!) {
      winnerss(where: { game_id: $gameId }) {
        items {
          game_id
          player_address
          prize_amount
        }
      }
    }`,
    { gameId }
  );

  console.log('\n' + '='.repeat(60));
  console.log('All tests completed!');
}

runTests().catch(console.error);
