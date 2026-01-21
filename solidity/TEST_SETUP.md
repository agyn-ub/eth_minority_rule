# Test Setup Script - Quick Reference

This script sets up a complete test scenario for the Minority Rule Game with 7 players.

## Quick Start

### 1. Start Anvil (if not already running)

```bash
# Option A: Basic anvil
anvil

# Option B: With state persistence (recommended)
anvil --state .anvil-state.json --state-interval 10
```

### 2. Run the test setup script

```bash
cd solidity ./script/run-test-setup.sh
```

Or manually with forge:

```bash
forge script script/TestSetup.s.sol:TestSetup \
    --rpc-url http://localhost:8545 \
    --broadcast \
    -vvv
```

### 3. Test from browser
- Connect your wallet to Anvil (localhost:8545)
- Import one of the test accounts
- Call `processRound()` on the game contract

## What the Script Does

1. **Deploys contract** (if needed) or uses existing `GAME_ADDRESS`
2. **Creates game** (Account 0) with:
   - Entry fee: 0.1 ETH
   - Commit deadline: 3 minutes
   - Reveal deadline: 2 minutes
3. **Players join** (Accounts 1-6)
4. **All commit votes**:
   - Accounts 0, 1, 2: Vote YES ✅
   - Accounts 3, 4, 5, 6: Vote NO ❌
5. **All reveal votes**
6. **Stops before processRound** - YOU test this!

## Expected Result

When you call `processRound()`:
- **YES votes**: 3 (minority)
- **NO votes**: 4 (majority)
- **Winners/Survivors**: Accounts 0, 1, 2 (they voted for minority)

## Anvil Test Accounts

| Account | Address | Private Key | Vote |
|---------|---------|-------------|------|
| 0 (Creator) | `0xf39Fd...2266` | `0xac097...ff80` | YES ✅ |
| 1 | `0x70997...79C8` | `0x59c69...690d` | YES ✅ |
| 2 | `0x3C44C...93BC` | `0x5de41...365a` | YES ✅ |
| 3 | `0x90F79...3b906` | `0x7c852...07a6` | NO ❌ |
| 4 | `0x15d34...C6A65` | `0x47e17...926a` | NO ❌ |
| 5 | `0x99655...0A4dc` | `0x8b3a3...ffba` | NO ❌ |
| 6 | `0x976EA...0aa9` | `0x92db1...564e` | NO ❌ |

## Using with Existing Contract

To use an already deployed contract:

```bash
export GAME_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
./script/run-test-setup.sh
```

## Importing Account to MetaMask

1. Open MetaMask
2. Click account icon → Import Account
3. Paste one of the private keys above
4. Connect to localhost:8545

## Troubleshooting

### Anvil not running
```bash
# Start anvil first
anvil
```

### Want to reset everything
```bash
# Delete anvil state and restart
rm .anvil-state.json
anvil --state .anvil-state.json --state-interval 10
```

### Script fails with "commit deadline passed"
The deadlines are real-time. If you wait too long, you may need to:
- Re-run the script
- Or modify `COMMIT_DURATION` and `REVEAL_DURATION` in the script

## Contract Interaction Example

After running the script, you can interact with the contract:

```javascript
// In your browser console or frontend
const gameId = 1; // From script output
await contract.processRound(gameId);
```

Or with cast:

```bash
cast send <CONTRACT_ADDRESS> "processRound(uint256)" 1 \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Notes

- Entry fee is 0.1 ETH per player
- Total prize pool: 0.7 ETH (7 players × 0.1 ETH)
- Platform fee: 2% (0.014 ETH)
- Prize for winners: 0.686 ETH split among 3 winners = ~0.2287 ETH each
- The script simulates a realistic game scenario for testing eliminations
