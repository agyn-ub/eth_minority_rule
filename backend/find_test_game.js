import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres'
});

await client.connect();

const game = await client.query("SELECT * FROM games WHERE question_text = 'Should we continue this experiment?'");

if (game.rows.length === 0) {
  console.log('❌ Game not found! Checking all games:');
  const all = await client.query('SELECT game_id, question_text, created_at FROM games ORDER BY game_id');
  all.rows.forEach(g => console.log(`  Game ${g.game_id}: "${g.question_text}" (${g.created_at})`));
} else {
  const g = game.rows[0];
  console.log('✅ Found test game:');
  console.log('  ID:', g.game_id);
  console.log('  State:', g.state);
  console.log('  Players:', g.total_players);
  
  const players = await client.query(`SELECT COUNT(*) FROM players WHERE game_id = ${g.game_id}`);
  const commits = await client.query(`SELECT COUNT(*) FROM commits WHERE game_id = ${g.game_id}`);
  const votes = await client.query(`SELECT COUNT(*) FROM votes WHERE game_id = ${g.game_id}`);
  
  console.log('  Players in DB:', players.rows[0].count);
  console.log('  Commits in DB:', commits.rows[0].count);
  console.log('  Votes in DB:', votes.rows[0].count);
}

await client.end();
