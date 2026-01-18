import { createPublicClient, http, formatEther, type Address } from 'viem';
import { foundry } from 'viem/chains';
import MinorityRuleGameABI from './abis/MinorityRuleGame.json' assert { type: 'json' };

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const;

const publicClient = createPublicClient({
  chain: foundry,
  transport: http('http://127.0.0.1:8545'),
});

async function checkGameResult() {
  const gameId = 9n;

  console.log('\n🔍 Checking Game #9 Final Results\n');

  const gameInfo = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MinorityRuleGameABI,
    functionName: 'getGameInfo',
    args: [gameId],
  }) as any;

  const [
    id,
    questionText,
    entryFee,
    creator,
    gameState,
    currentRound,
    totalPlayers,
    yesVotes,
    noVotes,
    prizePool,
    commitDeadline,
    revealDeadline,
    players,
    remainingPlayers,
    winners
  ] = gameInfo;

  const gameStates = ['ZeroPhase', 'CommitPhase', 'RevealPhase', 'Completed'];

  console.log('📊 Game Information:');
  console.log(`   Game ID: ${gameId}`);
  console.log(`   Question: "${questionText}"`);
  console.log(`   State: ${gameStates[gameState]}`);
  console.log(`   Total Rounds: ${currentRound}`);
  console.log(`   Total Players: ${totalPlayers}`);
  console.log(`   Entry Fee: ${formatEther(entryFee)} ETH`);
  console.log(`   Prize Pool: ${formatEther(prizePool)} ETH`);

  console.log('\n🏆 Final Results:');
  console.log(`   Winners: ${winners.length}`);

  if (winners.length > 0) {
    const platformFee = prizePool * 2n / 100n;
    const netPrize = prizePool - platformFee;
    const prizePerWinner = netPrize / BigInt(winners.length);

    console.log(`   Platform Fee (2%): ${formatEther(platformFee)} ETH`);
    console.log(`   Net Prize: ${formatEther(netPrize)} ETH`);
    console.log(`   Prize per Winner: ${formatEther(prizePerWinner)} ETH`);
    console.log('\n   Winners:');
    winners.forEach((winner: Address, i: number) => {
      console.log(`   ${i + 1}. ${winner}`);
    });
  } else {
    console.log('   No winners found (check contract state)');
  }

  console.log(`\n📈 Last Round Stats:`);
  console.log(`   YES votes: ${yesVotes}`);
  console.log(`   NO votes: ${noVotes}`);
  console.log(`   Minority: ${yesVotes <= noVotes ? 'YES' : 'NO'}`);

  console.log(`\n   Remaining Players: ${remainingPlayers.length}`);
  if (remainingPlayers.length > 0) {
    remainingPlayers.forEach((player: Address, i: number) => {
      console.log(`   ${i + 1}. ${player}`);
    });
  }
}

checkGameResult()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
