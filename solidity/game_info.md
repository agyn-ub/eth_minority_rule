# Game Info Commands

## Quick Commands

### Using the script:
```bash
./get_game_info.sh          # Check game ID 1 (default)
./get_game_info.sh 5        # Check game ID 5
```

---

## Manual Commands

### Check game with default settings (Game ID 1):
```bash
forge script script/GetGameInfo.s.sol --rpc-url http://localhost:8545
```

### Check specific game ID:
```bash
GAME_ID=5 forge script script/GetGameInfo.s.sol --rpc-url http://localhost:8545
```

### Check game with custom contract address:
```bash
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 GAME_ID=1 forge script script/GetGameInfo.s.sol --rpc-url http://localhost:8545
```

### Check game on different network (Base Sepolia):
```bash
GAME_ID=1 forge script script/GetGameInfo.s.sol --rpc-url https://sepolia.base.org
```

---

## Environment Variables

- `CONTRACT_ADDRESS` - Contract address (default: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
- `GAME_ID` - Game ID to query (default: 1)
- `--rpc-url` - RPC endpoint (default for script: localhost:8545)

---

## Examples

```bash
# Check if game 10 exists
GAME_ID=10 forge script script/GetGameInfo.s.sol --rpc-url http://localhost:8545

# Check game 3 on different contract
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 GAME_ID=3 forge script script/GetGameInfo.s.sol --rpc-url http://localhost:8545
```
