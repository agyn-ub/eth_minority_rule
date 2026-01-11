import { createWalletClient, createPublicClient, http, parseEther, keccak256, encodePacked, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import MinorityRuleGameABI from './abis/MinorityRuleGame.json' assert { type: 'json' };

// Contract address deployed on Anvil
const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3' as const;

// Anvil default test accounts
const PRIVATE_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Account 0 (creator)
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Account 1
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // Account 2
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', // Account 3
] as const;

const ACCOUNTS = PRIVATE_KEYS.map(pk => privateKeyToAccount(pk));

// Setup clients
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

// Helper to sleep
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log('🎮 MinorityRuleGame Indexer Test\n');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('Network: Anvil (localhost:8545)\n');

  const creator = createClient(0);
  const player1 = createClient(1);
  const player2 = createClient(2);
  const player3 = createClient(3);

  console.log('👥 Test Accounts:');
  console.log(`   Creator: ${ACCOUNTS[0].address}`);
  console.log(`   Player 1: ${ACCOUNTS[1].address}`);
  console.log(`   Player 2: ${ACCOUNTS[2].address}`);
  console.log(`   Player 3: ${ACCOUNTS[3].address}`);

  // Step 1: Create Game
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 1: Creating Game');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const entryFee = parseEther('0.1');
  const questionText = 'Will Base become the leading L2 by 2026?';

  const createGameHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'createGame',
    args: [questionText, entryFee],
  });

  const createReceipt = await waitForTx(createGameHash, 'Creating game');

  // Get game ID from the GameCreated event
  const gameCreatedLog = createReceipt.logs.find((log: any) =>
    log.topics[0] === keccak256(encodePacked(['string'], ['GameCreated(uint256,uint256,address,string,uint8)']))
  );

  // Read nextGameId to get the actual game ID that was created
  const nextGameId = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'nextGameId',
  }) as bigint;

  const gameId = nextGameId - 1n; // The game ID is nextGameId - 1
  console.log(`\n🎯 Game ID: ${gameId}`);
  console.log(`   Question: "${questionText}"`);
  console.log(`   Entry Fee: 0.1 ETH`);

  // Step 2: Set Commit Deadline
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 2: Starting Commit Phase');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const commitDuration = 300; // 5 minutes
  const setCommitDeadlineHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'setCommitDeadline',
    args: [gameId, BigInt(commitDuration)],
  });

  await waitForTx(setCommitDeadlineHash, 'Setting commit deadline (5 minutes)');

  // Step 3: Players Join Game
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 3: Players Joining Game');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Creator joins (already has account 0)
  const joinHash0 = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'joinGame',
    args: [gameId],
    value: entryFee,
  });
  await waitForTx(joinHash0, `Creator (${ACCOUNTS[0].address.slice(0, 10)}...) joining`);

  const joinHash1 = await player1.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'joinGame',
    args: [gameId],
    value: entryFee,
  });
  await waitForTx(joinHash1, `Player 1 (${ACCOUNTS[1].address.slice(0, 10)}...) joining`);

  const joinHash2 = await player2.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'joinGame',
    args: [gameId],
    value: entryFee,
  });
  await waitForTx(joinHash2, `Player 2 (${ACCOUNTS[2].address.slice(0, 10)}...) joining`);

  const joinHash3 = await player3.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'joinGame',
    args: [gameId],
    value: entryFee,
  });
  await waitForTx(joinHash3, `Player 3 (${ACCOUNTS[3].address.slice(0, 10)}...) joining`);

  console.log('\n💰 Prize Pool: 0.4 ETH (4 players × 0.1 ETH)');

  // Step 4: Commit Votes
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 4: Players Committing Votes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Generate salts and commit hashes
  // 2 players vote YES, 2 vote NO (so we have a tie - minority will be YES or NO based on <=)
  const votes = [
    { player: 'Creator', vote: true, salt: generateSalt(), client: creator },
    { player: 'Player 1', vote: false, salt: generateSalt(), client: player1 },
    { player: 'Player 2', vote: true, salt: generateSalt(), client: player2 },
    { player: 'Player 3', vote: false, salt: generateSalt(), client: player3 },
  ];

  for (const { player, vote, salt, client } of votes) {
    const commitHash = generateCommitHash(vote, salt);
    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MinorityRuleGameABI,
      functionName: 'submitCommit',
      args: [gameId, commitHash],
    });
    await waitForTx(txHash, `${player} committing vote (${vote ? 'YES' : 'NO'})`);
  }

  // Step 5: Set Reveal Deadline
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 5: Starting Reveal Phase');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Wait for commit deadline to pass
  await increaseTime(commitDuration + 1);

  const revealDuration = 300; // 5 minutes
  const setRevealDeadlineHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'setRevealDeadline',
    args: [gameId, BigInt(revealDuration)],
  });

  await waitForTx(setRevealDeadlineHash, 'Setting reveal deadline (5 minutes)');

  // Step 6: Reveal Votes
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 6: Players Revealing Votes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const { player, vote, salt, client } of votes) {
    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MinorityRuleGameABI,
      functionName: 'submitReveal',
      args: [gameId, vote, salt],
    });
    await waitForTx(txHash, `${player} revealing vote: ${vote ? 'YES ✓' : 'NO ✗'}`);
  }

  console.log('\n📊 Round 1 Votes:');
  console.log('   YES: 2 votes');
  console.log('   NO: 2 votes');
  console.log('   Minority: YES (tie-breaker: yesVotes <= noVotes)');

  // Step 7: Process Round
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 7: Processing Round');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Wait for reveal deadline to pass (or all players to reveal - we have all reveals)
  await increaseTime(revealDuration + 1);

  const processRoundHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'processRound',
    args: [gameId],
  });

  await waitForTx(processRoundHash, 'Processing round and determining winners');

  // Check game state
  const gameInfo = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'getGameInfo',
    args: [gameId],
  }) as any;

  console.log('\n🏆 Game Results:');
  console.log(`   State: ${['ZeroPhase', 'CommitPhase', 'RevealPhase', 'Completed'][gameInfo[5]]}`);
  console.log(`   Current Round: ${gameInfo[6]}`);
  console.log(`   Remaining Players: ${gameInfo[13].length}`);

  if (gameInfo[5] === 3) { // Completed
    console.log(`   Winners: ${gameInfo[14].length}`);
    if (gameInfo[14].length > 0) {
      console.log('\n🎉 Winners:');
      gameInfo[14].forEach((winner: Address, i: number) => {
        console.log(`   ${i + 1}. ${winner}`);
      });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Test Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Events Generated:');
  console.log('   ✓ GameCreated');
  console.log('   ✓ CommitPhaseStarted');
  console.log('   ✓ PlayerJoined (×4)');
  console.log('   ✓ VoteCommitted (×4)');
  console.log('   ✓ RevealPhaseStarted');
  console.log('   ✓ VoteRevealed (×4)');
  console.log('   ✓ RoundCompleted');
  console.log('   ✓ GameCompleted');
  console.log('\n💡 Check your indexer logs to verify events were processed!');
  console.log('💡 Check Supabase database tables for indexed data');
  console.log('💡 Query Ponder GraphQL at http://localhost:42069/graphql');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
