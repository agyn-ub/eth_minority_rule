#!/bin/bash
set -e

GAME_ID=2
CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PK_0="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK_1="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK_2="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

echo "=== ROUND 2: 3 players remaining ==="
echo "Survivors: Account 0, 1, 2 (all voted YES in round 1)"
echo

echo "Setting commit deadline (5s)..."
cast send $CONTRACT "setCommitDeadline(uint256,uint256)" $GAME_ID 5 \
  --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
sleep 5

echo "Commits for Round 2:"
# Account 0: YES, Account 1: NO, Account 2: NO
SALT_0_R2="0x0000000000000000000000000000000000000000000000000000000000001111"
COMMIT_0_R2=$(cast keccak "0x01${SALT_0_R2:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_0_R2 \
  --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo "  Account 0 committed (YES)"

SALT_1_R2="0x0000000000000000000000000000000000000000000000000000000000002222"
COMMIT_1_R2=$(cast keccak "0x00${SALT_1_R2:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_1_R2 \
  --private-key $PK_1 --rpc-url http://localhost:8545 > /dev/null
echo "  Account 1 committed (NO)"

SALT_2_R2="0x0000000000000000000000000000000000000000000000000000000000003333"
COMMIT_2_R2=$(cast keccak "0x00${SALT_2_R2:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_2_R2 \
  --private-key $PK_2 --rpc-url http://localhost:8545 > /dev/null
echo "  Account 2 committed (NO)"
echo

echo "Setting reveal deadline (5s)..."
cast send $CONTRACT "setRevealDeadline(uint256,uint256)" $GAME_ID 5 \
  --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
sleep 5

echo "Reveals for Round 2:"
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_0_R2 \
  --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo "  Account 0 revealed (YES)"

cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_1_R2 \
  --private-key $PK_1 --rpc-url http://localhost:8545 > /dev/null
echo "  Account 1 revealed (NO)"

cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_2_R2 \
  --private-key $PK_2 --rpc-url http://localhost:8545 > /dev/null
echo "  Account 2 revealed (NO)"
echo

echo "Waiting for indexer to process reveals..."
sleep 3

echo "Processing Round 2..."
cast send $CONTRACT "processRound(uint256)" $GAME_ID \
  --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo "✓ Round 2 processed - Account 0 should win (minority YES voter)"
echo

sleep 2
echo "Paying out winner..."
cast send $CONTRACT "payWinner(uint256)" $GAME_ID \
  --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo "✓ Winner paid!"
