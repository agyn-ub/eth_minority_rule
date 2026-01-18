import { createPublicClient, http, formatEther, parseAbiItem } from 'viem';
import { foundry } from 'viem/chains';

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const;

const publicClient = createPublicClient({
  chain: foundry,
  transport: http('http://127.0.0.1:8545'),
});

async function checkEvents() {
  console.log('\n🔍 Checking Game #9 Events\n');

  // Get GameCompleted events
  const gameCompletedEvents = await publicClient.getLogs({
    address: CONTRACT_ADDRESS,
    event: parseAbiItem('event GameCompleted(uint256 indexed gameId, uint8 totalRounds, address[] winners, uint256 prizePerWinner)'),
    args: {
      gameId: 9n
    },
    fromBlock: 0n,
    toBlock: 'latest'
  });

  if (gameCompletedEvents.length > 0) {
    console.log('🎉 GameCompleted Event Found:\n');
    const event = gameCompletedEvents[0];
    const { gameId, totalRounds, winners, prizePerWinner } = event.args as any;

    console.log(`   Game ID: ${gameId}`);
    console.log(`   Total Rounds: ${totalRounds}`);
    console.log(`   Winners: ${winners.length}`);
    console.log(`   Prize per Winner: ${formatEther(prizePerWinner)} ETH`);

    if (winners.length > 0) {
      console.log('\n   🏆 Winners:');
      winners.forEach((winner: string, i: number) => {
        console.log(`   ${i + 1}. ${winner}`);
      });
    }
  } else {
    console.log('❌ No GameCompleted event found for Game #9');
  }

  // Get RoundCompleted events
  console.log('\n📊 Round Completion Events:\n');
  const roundEvents = await publicClient.getLogs({
    address: CONTRACT_ADDRESS,
    event: parseAbiItem('event RoundCompleted(uint256 indexed gameId, uint8 round, uint32 yesVotes, uint32 noVotes, bool minorityVote, address[] survivors)'),
    args: {
      gameId: 9n
    },
    fromBlock: 0n,
    toBlock: 'latest'
  });

  roundEvents.forEach((event) => {
    const { round, yesVotes, noVotes, minorityVote, survivors } = event.args as any;
    console.log(`   Round ${round}:`);
    console.log(`   - YES: ${yesVotes}, NO: ${noVotes}`);
    console.log(`   - Minority: ${minorityVote ? 'YES' : 'NO'}`);
    console.log(`   - Survivors: ${survivors.length}`);
  });
}

checkEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
