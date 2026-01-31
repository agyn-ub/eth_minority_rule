// Quick script to check what games exist in the database
// Run with: node check-games.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl, supabaseKey;

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const lines = envFile.split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();

    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = value;
    } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      supabaseKey = value;
    }
  }
} catch (error) {
  console.error('Error reading .env.local:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGames() {
  console.log('Fetching all games from database...\n');

  // Get all games
  const { data: allGames, error } = await supabase
    .from('games')
    .select('game_id, question_text, state, current_round, total_players, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
    return;
  }

  if (!allGames || allGames.length === 0) {
    console.log('❌ No games found in database!');
    return;
  }

  console.log(`✅ Found ${allGames.length} total games:\n`);

  // Group by state
  const byState = {};
  allGames.forEach(game => {
    if (!byState[game.state]) byState[game.state] = [];
    byState[game.state].push(game);
  });

  // Print summary
  console.log('📊 Games by State:');
  Object.entries(byState).forEach(([state, games]) => {
    console.log(`  ${state}: ${games.length} game(s)`);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  // Print each game
  allGames.forEach(game => {
    console.log(`Game ID: ${game.game_id}`);
    console.log(`Question: ${game.question_text || 'N/A'}`);
    console.log(`State: ${game.state}`);
    console.log(`Round: ${game.current_round}`);
    console.log(`Players: ${game.total_players}`);
    console.log(`Created: ${new Date(game.created_at).toLocaleString()}`);

    // Check if it would show with new filter
    const showsInNew = game.current_round === 1 && game.state === 'CommitPhase';
    const showsInOngoing = game.current_round > 1 && game.state === 'CommitPhase';
    const showsAnywhere = showsInNew || showsInOngoing || game.state === 'Completed';

    if (showsAnywhere) {
      console.log(`✅ Visible on homepage (${showsInNew ? 'New' : showsInOngoing ? 'Ongoing' : 'Completed'} tab)`);
    } else {
      console.log(`❌ NOT visible with current filter (state: ${game.state}, round: ${game.current_round})`);
    }

    console.log('-'.repeat(80));
  });

  // Recommendations
  console.log('\n💡 Recommendations:');
  const hiddenGames = allGames.filter(g => {
    const showsInNew = g.current_round === 1 && g.state === 'CommitPhase';
    const showsInOngoing = g.current_round > 1 && g.state === 'CommitPhase';
    return !showsInNew && !showsInOngoing && g.state !== 'Completed';
  });

  if (hiddenGames.length > 0) {
    console.log(`⚠️  You have ${hiddenGames.length} game(s) that won't show on the homepage:`);
    hiddenGames.forEach(g => {
      console.log(`   - Game ${g.game_id}: ${g.state} (Round ${g.current_round})`);
    });
    console.log('\nThese games are hidden because they are not in CommitPhase.');
    console.log('Options:');
    console.log('  1. Wait for them to enter CommitPhase (if they\'re in RevealPhase)');
    console.log('  2. Process the round to move them forward (if stuck)');
    console.log('  3. Adjust the filter if you want to show games in other states');
  } else {
    console.log('✅ All active games are visible on the homepage!');
  }
}

checkGames().catch(console.error);
