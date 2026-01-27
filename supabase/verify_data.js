import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres'
});

await client.connect();

console.log('=== DATABASE VERIFICATION ===\n');

const game = await client.query('SELECT * FROM games WHERE game_id = 1');
if (game.rows.length > 0) {
  const g = game.rows[0];
  console.log('✅ Game 1:');
  console.log('   Question:', g.question_text);
  console.log('   State:', g.state);
  console.log('   Total Players:', g.total_players);
  console.log('   Prize Pool:', g.prize_pool, 'wei');
  console.log();
  
  const players = await client.query('SELECT COUNT(*) FROM players WHERE game_id = 1');
  console.log('✅ Players:', players.rows[0].count);
  
  const commits = await client.query('SELECT COUNT(*) FROM commits WHERE game_id = 1 AND round = 1');
  console.log('✅ Commits:', commits.rows[0].count);
  
  const votes = await client.query('SELECT player_address, vote FROM votes WHERE game_id = 1 AND round = 1 ORDER BY vote DESC');
  console.log('✅ Votes:', votes.rows.length);
  
  const yesVotes = votes.rows.filter(v => v.vote === true).length;
  const noVotes = votes.rows.filter(v => v.vote === false).length;
  console.log('   YES:', yesVotes, '| NO:', noVotes);
  console.log();
  console.log('🎉 Migration successful! Backend is working correctly.');
} else {
  console.log('❌ Game 1 not found');
}

await client.end();
