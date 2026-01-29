import { createWalletClient, createPublicClient, http, parseEther, keccak256, encodePacked, type Address, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import MinorityRuleGameABI from './abis/MinorityRuleGame.json' assert { type: 'json' };

// Contract address deployed on Anvil
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

// Game configuration
const ENTRY_FEE = parseEther('0.1');
const QUESTION_TEXT = 'Will Base become the leading L2 by 2026?';
const COMMIT_DURATION = 60; // seconds
const REVEAL_DURATION = 60; // seconds
const TIME_BUFFER = 1; // extra second to ensure deadline passed

// Anvil default test accounts (10 accounts: 0 = creator, 1-9 = players)
const PRIVATE_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // 0 - Creator
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // 1
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // 2
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', // 3
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a', // 4
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba', // 5
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e', // 6
  '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356', // 7
  '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97', // 8
  '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6', // 9
] as const;

// Vote patterns for THREE-round elimination
// Round 1: 5 YES, 4 NO → NO minority → survivors [1, 3, 6, 7] (4 players)
const ROUND_1_VOTES: Record<number, boolean> = {
  0: true,  // YES - eliminated
  1: false, // NO - survives
  2: true,  // YES - eliminated
  3: false, // NO - survives
  4: true,  // YES - eliminated
  5: true,  // YES - eliminated
  6: false, // NO - survives
  7: false, // NO - survives
  8: true,  // YES - eliminated
};

// Round 2: 2 YES, 2 NO (tie) → YES wins tie → survivors [1, 3] (2 players)
const ROUND_2_VOTES: Record<number, boolean> = {
  1: true,  // YES - survives
  3: true,  // YES - survives
  6: false, // NO - eliminated
  7: false, // NO - eliminated
};

// Round 3: 1 YES, 1 NO (tie) → YES wins tie → winner [1] (1 winner)
const ROUND_3_VOTES: Record<number, boolean> = {
  1: true,  // YES - WINS!
  3: false, // NO - eliminated
};

// Setup accounts and clients
const ACCOUNTS = PRIVATE_KEYS.map(pk => privateKeyToAccount(pk));

const publicClient = createPublicClient({
  chain: foundry,
  transport: http('http://127.0.0.1:8545'),
});

function createClient(accountIndex: number) {
  return createWalletClient({
    account: ACCOUNTS[accountIndex],
    chain: foundry,
    transport: http('http://127.0.0.1:8545'),
  });
}

// Helper function to wait for transaction
async function waitForTx(hash: `0x${string}`, label: string) {
  console.log(`\n📝 ${label}`);
  console.log(`   Transaction: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

// Helper to generate commit hash
function generateCommitHash(vote: boolean, salt: `0x${string}`): `0x${string}` {
  return keccak256(encodePacked(['bool', 'bytes32'], [vote, salt]));
}

// Helper to generate random salt
function generateSalt(): `0x${string}` {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return `0x${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

// Helper to increase Anvil time
async function increaseTime(seconds: number) {
  await publicClient.request({
    method: 'evm_increaseTime' as any,
    params: [seconds],
  });
  // Mine a block to apply the time increase
  await publicClient.request({
    method: 'evm_mine' as any,
    params: [],
  });
  console.log(`   ⏰ Fast-forwarded ${seconds} seconds`);
}

async function main() {
  console.log('\n🎮 MinorityRuleGame THREE-ROUND Simulation\n');
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Network: Anvil (localhost:8545)\n`);

  // Display test accounts
  console.log('👥 Test Accounts:');
  console.log(`   Creator: ${ACCOUNTS[0].address} (Account 0)`);
  for (let i = 1; i < ACCOUNTS.length; i++) {
    console.log(`   Player ${i}: ${ACCOUNTS[i].address} (Account ${i})`);
  }

  const creatorClient = createClient(0);

  // ============================================
  // CREATE GAME
  // ============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Creating Game');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const createGameHash = await creatorClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'createGame',
    args: [QUESTION_TEXT, ENTRY_FEE],
  });

  await waitForTx(createGameHash, 'Creating game');

  // Get game ID from nextGameId (current game is nextGameId - 1)
  const nextGameId = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'nextGameId',
  }) as bigint;

  const gameId = nextGameId - 1n;
  console.log(`\n🎯 Game ID: ${gameId}`);
  console.log(`   Question: "${QUESTION_TEXT}"`);
  console.log(`   Entry Fee: ${formatEther(ENTRY_FEE)} ETH`);

  // ============================================
  // ROUND 1: 9 Players → 4 Survivors
  // ============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ROUND 1: 9 Players');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runRound(gameId, ROUND_1_VOTES, [0, 1, 2, 3, 4, 5, 6, 7, 8], true);

  // ============================================
  // ROUND 2: 4 Survivors → 2 Survivors
  // ============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ROUND 2: 4 Players');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runRound(gameId, ROUND_2_VOTES, [1, 3, 6, 7], false);

  // ============================================
  // ROUND 3: 2 Survivors → 1 Winner
  // ============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ROUND 3: 2 Players');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runRound(gameId, ROUND_3_VOTES, [1, 3], false);

  // ============================================
  // GAME COMPLETE
  // ============================================
  console.log('\n🎉 GAME COMPLETED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Read final game state
  const finalGameInfo = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'getGameInfo',
    args: [gameId],
  }) as any[];

  console.log(`Game ID: ${gameId}`);
  console.log(`Total Rounds: 3`);
  console.log(`Entry Fee: ${formatEther(ENTRY_FEE)} ETH`);
  console.log(`Total Players: 9`);
  console.log(`Prize Pool: ${formatEther(finalGameInfo[9] || 0n)} ETH`);
  console.log(`Platform Fee (2%): ${formatEther(finalGameInfo[14] || 0n)} ETH`);

  // Get winners
  const winnersData = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'getWinners',
    args: [gameId],
  }) as any;

  console.log(`\n🏆 WINNER (1):`);
  if (winnersData && winnersData.length > 0) {
    winnersData.forEach((winner: any, index: number) => {
      const winnerAddr = winner[0] as Address;
      const prize = winner[1] as bigint;
      const accountNum = ACCOUNTS.findIndex(acc => acc.address.toLowerCase() === winnerAddr.toLowerCase());
      console.log(`   ${index + 1}. ${winnerAddr.slice(0, 6)}...${winnerAddr.slice(-4)} (Account ${accountNum}) → ${formatEther(prize)} ETH`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Simulation Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 Events Generated:');
  console.log('   ✓ GameCreated');
  console.log('   ✓ CommitPhaseStarted (×3)');
  console.log('   ✓ PlayerJoined (×9)');
  console.log('   ✓ VoteCommitted (×15 total)');
  console.log('   ✓ RevealPhaseStarted (×3)');
  console.log('   ✓ VoteRevealed (×15 total)');
  console.log('   ✓ RoundCompleted (×3)');
  console.log('   ✓ GameCompleted');
  console.log('\n💡 Check your Ponder indexer logs to verify events were processed!');
  console.log('💡 Check Supabase database tables for indexed data');
  console.log('💡 Query Ponder GraphQL at http://localhost:42069/graphql');
}

async function runRound(
  gameId: bigint,
  votePattern: Record<number, boolean>,
  playerAccounts: number[],
  isFirstRound: boolean
) {
  const creatorClient = createClient(0);

  // Start commit phase
  console.log('\n📅 Starting Commit Phase\n');

  const startCommitHash = await creatorClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'setCommitDeadline',
    args: [gameId, BigInt(COMMIT_DURATION)],
  });

  await waitForTx(startCommitHash, `Setting commit deadline (${COMMIT_DURATION}s)`);

  // Players join (only in first round)
  if (isFirstRound) {
    console.log('\n👥 Players Joining Game\n');

    for (const accountIndex of playerAccounts) {
      const playerClient = createClient(accountIndex);
      const joinHash = await playerClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: MinorityRuleGameABI,
        functionName: 'joinGame',
        args: [gameId],
        value: ENTRY_FEE,
      });

      await waitForTx(
        joinHash,
        `${ACCOUNTS[accountIndex].address.slice(0, 6)}...${ACCOUNTS[accountIndex].address.slice(-4)} (Account ${accountIndex}) joining`
      );
    }

    console.log(`\n💰 Prize Pool: ${formatEther(ENTRY_FEE * BigInt(playerAccounts.length))} ETH (${playerAccounts.length} players × ${formatEther(ENTRY_FEE)} ETH)`);
  }

  // Commit votes
  console.log('\n🗳️  Committing votes...');

  const salts: Record<number, `0x${string}`> = {};
  let commitCount = 0;

  for (const accountIndex of playerAccounts) {
    const vote = votePattern[accountIndex];
    if (vote === undefined) continue;

    const salt = generateSalt();
    salts[accountIndex] = salt;
    const commitHash = generateCommitHash(vote, salt);

    const playerClient = createClient(accountIndex);
    await playerClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MinorityRuleGameABI,
      functionName: 'submitCommit',
      args: [gameId, commitHash],
    });

    commitCount++;
    console.log(`   ✓ Account ${accountIndex} (${ACCOUNTS[accountIndex].address.slice(0, 6)}...${ACCOUNTS[accountIndex].address.slice(-4)}): Committed`);
  }

  console.log(`   Summary: ${commitCount}/${playerAccounts.length} commits received`);

  // Wait for commit phase to end
  console.log('\n⏰ Fast-forwarding past commit deadline...');
  await increaseTime(COMMIT_DURATION + TIME_BUFFER);

  // Start reveal phase
  console.log('\n🔓 Starting Reveal Phase\n');

  const startRevealHash = await creatorClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'setRevealDeadline',
    args: [gameId, BigInt(REVEAL_DURATION)],
  });

  await waitForTx(startRevealHash, `Setting reveal deadline (${REVEAL_DURATION}s)`);

  // Reveal votes
  console.log('\n🔓 Revealing votes...');

  for (const accountIndex of playerAccounts) {
    const vote = votePattern[accountIndex];
    if (vote === undefined) continue;

    const salt = salts[accountIndex];
    const playerClient = createClient(accountIndex);

    await playerClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MinorityRuleGameABI,
      functionName: 'submitReveal',
      args: [gameId, vote, salt],
    });

    const voteSymbol = vote ? 'YES ✓' : 'NO ✗';
    console.log(`   ✓ Account ${accountIndex} (${ACCOUNTS[accountIndex].address.slice(0, 6)}...${ACCOUNTS[accountIndex].address.slice(-4)}): ${voteSymbol}`);
  }

  // Wait for reveal phase to end
  console.log('\n⏰ Fast-forwarding past reveal deadline...');
  await increaseTime(REVEAL_DURATION + TIME_BUFFER);

  // Process round
  console.log('\n⚙️  Processing round...\n');

  const processHash = await creatorClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'processRound',
    args: [gameId],
  });

  await waitForTx(processHash, 'Processing round and determining survivors/winners');

  // Read round results
  const gameInfo = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'getGameInfo',
    args: [gameId],
  }) as any[];

  const currentRound = gameInfo[4];
  const remainingPlayers = gameInfo[5] as Address[];

  // Count votes
  let yesCount = 0;
  let noCount = 0;
  for (const vote of Object.values(votePattern)) {
    if (vote === true) yesCount++;
    else noCount++;
  }

  const minorityVote = yesCount < noCount ? 'YES' : (noCount < yesCount ? 'NO' : 'YES (tie)');

  console.log('\n📊 ROUND RESULTS');
  console.log(`   YES: ${yesCount} votes`);
  console.log(`   NO: ${noCount} votes`);
  console.log(`   Minority: ${minorityVote}`);
  console.log(`   Survivors: ${remainingPlayers.length} players`);

  if (remainingPlayers.length > 0) {
    console.log('\n   Surviving Players:');
    remainingPlayers.forEach((addr: Address) => {
      const accountNum = ACCOUNTS.findIndex(acc => acc.address.toLowerCase() === addr.toLowerCase());
      console.log(`   • ${addr.slice(0, 6)}...${addr.slice(-4)} (Account ${accountNum})`);
    });
  }
}

main().catch(console.error);
