import { createWalletClient, createPublicClient, http, parseEther, keccak256, encodePacked, type Address, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import MinorityRuleGameABI from './abis/MinorityRuleGame.json' assert { type: 'json' };

// Contract address deployed on Anvil
const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const;

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

// Vote patterns for multi-round elimination
// Round 1: 4 YES, 5 NO → YES minority → survivors [0, 2, 5, 8]
const ROUND_1_VOTES: Record<number, boolean> = {
  0: true,  // YES - survives
  1: false, // NO - eliminated
  2: true,  // YES - survives
  3: false, // NO - eliminated
  4: false, // NO - eliminated
  5: true,  // YES - survives
  6: false, // NO - eliminated
  7: false, // NO - eliminated
  8: true,  // YES - survives
};

// Round 2: 2 YES, 2 NO (tie) → YES minority → winners [0, 2]
const ROUND_2_VOTES: Record<number, boolean> = {
  0: true,  // YES - wins
  2: true,  // YES - wins
  5: false, // NO - eliminated
  8: false, // NO - eliminated
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

// Helper to format address
function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to get account label
function getAccountLabel(address: string): string {
  const index = ACCOUNTS.findIndex(a => a.address.toLowerCase() === address.toLowerCase());
  return index >= 0 ? `Account ${index}` : 'Unknown';
}

// Display round summary
function displayRoundSummary(
  round: number,
  yesCount: number,
  noCount: number,
  minorityVote: boolean,
  remainingPlayers: Address[]
) {
  console.log('\n📊 ROUND RESULTS');
  console.log(`   YES: ${yesCount} votes`);
  console.log(`   NO: ${noCount} votes`);
  console.log(`   Minority: ${minorityVote ? 'YES' : 'NO'}`);
  console.log(`   Survivors: ${remainingPlayers.length} players`);

  if (remainingPlayers.length > 0) {
    console.log('\n   Surviving Players:');
    remainingPlayers.forEach((addr) => {
      console.log(`   • ${shortAddress(addr)} (${getAccountLabel(addr)})`);
    });
  }
}

// Display final results
function displayFinalResults(
  gameId: bigint,
  totalRounds: number,
  totalPlayers: number,
  prizePool: bigint,
  platformFee: bigint,
  winners: Address[],
  prizePerWinner: bigint
) {
  console.log('\n🎉 GAME COMPLETED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Game ID: ${gameId}`);
  console.log(`Total Rounds: ${totalRounds}`);
  console.log(`Entry Fee: ${formatEther(ENTRY_FEE)} ETH`);
  console.log(`Total Players: ${totalPlayers}`);
  console.log(`Prize Pool: ${formatEther(prizePool)} ETH`);
  console.log(`Platform Fee (2%): ${formatEther(platformFee)} ETH`);

  console.log(`\n🏆 WINNERS (${winners.length}):`);
  winners.forEach((winner, i) => {
    console.log(`   ${i + 1}. ${shortAddress(winner)} (${getAccountLabel(winner)}) → ${formatEther(prizePerWinner)} ETH`);
  });
}

// Execute a round
async function executeRound(
  roundNumber: number,
  gameId: bigint,
  creator: any,
  votePattern: Record<number, boolean>,
  isFirstRound: boolean
) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`ROUND ${roundNumber}: ${Object.keys(votePattern).length} Players`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Step 1: Set Commit Deadline
  console.log('\n📅 Starting Commit Phase');
  const setCommitDeadlineHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'setCommitDeadline',
    args: [gameId, BigInt(COMMIT_DURATION)],
  });
  await waitForTx(setCommitDeadlineHash, `Setting commit deadline (${COMMIT_DURATION}s)`);

  // Step 2: Players Join (Round 1 only)
  if (isFirstRound) {
    console.log('\n👥 Players Joining Game');
    for (const accountIndex of Object.keys(votePattern).map(Number)) {
      const client = createClient(accountIndex);
      const joinHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: MinorityRuleGameABI,
        functionName: 'joinGame',
        args: [gameId],
        value: ENTRY_FEE,
      });
      await waitForTx(joinHash, `${shortAddress(ACCOUNTS[accountIndex].address)} (${getAccountLabel(ACCOUNTS[accountIndex].address)}) joining`);
    }
    const totalPrizePool = ENTRY_FEE * BigInt(Object.keys(votePattern).length);
    console.log(`\n💰 Prize Pool: ${formatEther(totalPrizePool)} ETH (${Object.keys(votePattern).length} players × ${formatEther(ENTRY_FEE)} ETH)`);
  }

  // Step 3: Commit Votes
  console.log('\n🗳️  Committing votes...');
  const commitData: Array<{ accountIndex: number; vote: boolean; salt: `0x${string}` }> = [];

  for (const [accountIndexStr, vote] of Object.entries(votePattern)) {
    const accountIndex = Number(accountIndexStr);
    const salt = generateSalt();
    const commitHash = generateCommitHash(vote, salt);
    const client = createClient(accountIndex);

    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MinorityRuleGameABI,
      functionName: 'submitCommit',
      args: [gameId, commitHash],
    });

    console.log(`   ✓ ${getAccountLabel(ACCOUNTS[accountIndex].address)} (${shortAddress(ACCOUNTS[accountIndex].address)}): Committed`);

    commitData.push({ accountIndex, vote, salt });
  }
  console.log(`   Summary: ${commitData.length}/${Object.keys(votePattern).length} commits received`);

  // Step 4: Fast-forward past commit deadline
  console.log(`\n⏰ Fast-forwarding past commit deadline...`);
  await increaseTime(COMMIT_DURATION + TIME_BUFFER);

  // Step 5: Set Reveal Deadline
  console.log('\n🔓 Starting Reveal Phase');
  const setRevealDeadlineHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'setRevealDeadline',
    args: [gameId, BigInt(REVEAL_DURATION)],
  });
  await waitForTx(setRevealDeadlineHash, `Setting reveal deadline (${REVEAL_DURATION}s)`);

  // Step 6: Reveal Votes
  console.log('\n🔓 Revealing votes...');
  let yesCount = 0;
  let noCount = 0;

  for (const { accountIndex, vote, salt } of commitData) {
    const client = createClient(accountIndex);
    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MinorityRuleGameABI,
      functionName: 'submitReveal',
      args: [gameId, vote, salt],
    });

    console.log(`   ✓ ${getAccountLabel(ACCOUNTS[accountIndex].address)} (${shortAddress(ACCOUNTS[accountIndex].address)}): ${vote ? 'YES ✓' : 'NO ✗'}`);

    if (vote) yesCount++;
    else noCount++;
  }

  // Step 7: Fast-forward past reveal deadline
  console.log(`\n⏰ Fast-forwarding past reveal deadline...`);
  await increaseTime(REVEAL_DURATION + TIME_BUFFER);

  // Step 8: Process Round
  console.log('\n⚙️  Processing round...');
  const processRoundHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'processRound',
    args: [gameId],
  });
  await waitForTx(processRoundHash, 'Processing round and determining survivors/winners');

  // Step 9: Get game state and display results
  const gameInfo = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'getGameInfo',
    args: [gameId],
  }) as any;

  const gameState = gameInfo[4]; // state (index 4, not 5)
  const currentRound = gameInfo[5]; // currentRound (index 5, not 6)
  const remainingPlayers = gameInfo[13] as Address[]; // remainingPlayers
  const winners = gameInfo[14] as Address[]; // winners

  // Determine minority vote (yesCount <= noCount means YES is minority)
  const minorityVote = yesCount <= noCount;

  displayRoundSummary(roundNumber, yesCount, noCount, minorityVote, remainingPlayers);

  // Return game state info
  return {
    gameState,
    currentRound,
    remainingPlayers,
    winners,
  };
}

async function main() {
  console.log('🎮 MinorityRuleGame Multi-Round Simulation\n');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('Network: Anvil (localhost:8545)\n');

  const creator = createClient(0);

  console.log('👥 Test Accounts:');
  console.log(`   Creator: ${ACCOUNTS[0].address} (Account 0)`);
  for (let i = 1; i <= 9; i++) {
    console.log(`   Player ${i}: ${ACCOUNTS[i].address} (Account ${i})`);
  }

  // Step 1: Create Game
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Creating Game');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const createGameHash = await creator.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'createGame',
    args: [QUESTION_TEXT, ENTRY_FEE],
  });

  await waitForTx(createGameHash, 'Creating game');

  // Get game ID from nextGameId
  const nextGameId = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'nextGameId',
  }) as bigint;

  const gameId = nextGameId - 1n;
  console.log(`\n🎯 Game ID: ${gameId}`);
  console.log(`   Question: "${QUESTION_TEXT}"`);
  console.log(`   Entry Fee: ${formatEther(ENTRY_FEE)} ETH`);

  try {
    // Execute Round 1
    const round1Result = await executeRound(1, gameId, creator, ROUND_1_VOTES, true);

    // Check if game is completed or continue to round 2
    if (round1Result.gameState === 3) { // Completed
      console.log('\n🏁 Game ended after Round 1!');

      const gameInfo = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: MinorityRuleGameABI,
        functionName: 'getGameInfo',
        args: [gameId],
      }) as any;

      const prizePool = gameInfo[9] as bigint; // prizePool at index 9
      const winners = gameInfo[14] as Address[];
      const platformFee = prizePool * 2n / 100n;
      const prizePerWinner = winners.length > 0 ? (prizePool - platformFee) / BigInt(winners.length) : 0n;

      displayFinalResults(gameId, 1, 9, prizePool, platformFee, winners, prizePerWinner);
      return;
    }

    // Execute Round 2
    const round2Result = await executeRound(2, gameId, creator, ROUND_2_VOTES, false);

    // Display final results
    if (round2Result.gameState === 3) { // Completed
      const gameInfo = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: MinorityRuleGameABI,
        functionName: 'getGameInfo',
        args: [gameId],
      }) as any;

      const currentRound = gameInfo[5] as number; // currentRound at index 5
      const prizePool = gameInfo[9] as bigint; // prizePool at index 9
      const winners = gameInfo[14] as Address[];
      const platformFee = prizePool * 2n / 100n;
      const prizePerWinner = winners.length > 0 ? (prizePool - platformFee) / BigInt(winners.length) : 0n;

      displayFinalResults(gameId, currentRound, 9, prizePool, platformFee, winners, prizePerWinner);
    }

  } catch (error) {
    console.error('\n❌ Error during simulation:', error);

    // Try to display current game state
    try {
      const gameInfo = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: MinorityRuleGameABI,
        functionName: 'getGameInfo',
        args: [gameId],
      }) as any;

      console.error('\n📊 Game State at Error:');
      console.error(`   State: ${['ZeroPhase', 'CommitPhase', 'RevealPhase', 'Completed'][gameInfo[4]]}`);
      console.error(`   Current Round: ${gameInfo[5]}`);
      console.error(`   Remaining Players: ${gameInfo[13].length}`);
    } catch (stateError) {
      console.error('   Unable to fetch game state');
    }

    process.exit(1);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Simulation Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Events Generated:');
  console.log('   ✓ GameCreated');
  console.log('   ✓ CommitPhaseStarted (×2)');
  console.log('   ✓ PlayerJoined (×9)');
  console.log('   ✓ VoteCommitted (×13 total)');
  console.log('   ✓ RevealPhaseStarted (×2)');
  console.log('   ✓ VoteRevealed (×13 total)');
  console.log('   ✓ RoundCompleted (×2)');
  console.log('   ✓ GameCompleted');
  console.log('\n💡 Check your Ponder indexer logs to verify events were processed!');
  console.log('💡 Check Supabase database tables for indexed data');
  console.log('💡 Query Ponder GraphQL at http://localhost:42069/graphql');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  });
