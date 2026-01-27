import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres'
});

await client.connect();

const gameId = '2';

// Check votes for round 1
console.log('=== Round 1 Votes ===');
const votes = await client.query(
  `SELECT player_address, vote FROM votes WHERE game_id = $1 AND round = 1 ORDER BY player_address`,
  [gameId]
);
votes.rows.forEach(v => {
  const addr = v.player_address.substring(0, 10) + '...';
  console.log(`  ${addr}: ${v.vote ? 'YES' : 'NO'}`);
});

console.log('\n=== Elimination Status ===');
const eliminations = await client.query(
  `SELECT player_address, eliminated, eliminated_round FROM eliminations WHERE game_id = $1 ORDER BY player_address`,
  [gameId]
);
eliminations.rows.forEach(e => {
  const addr = e.player_address.substring(0, 10) + '...';
  const status = e.eliminated ? `ELIMINATED (Round ${e.eliminated_round})` : 'ALIVE';
  console.log(`  ${addr}: ${status}`);
});

await client.end();
