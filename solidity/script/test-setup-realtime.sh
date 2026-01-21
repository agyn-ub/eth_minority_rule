#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
COMMIT_DURATION=10  # 10 seconds
REVEAL_DURATION=6   # 6 seconds
ENTRY_FEE="0.1ether"

# Anvil default accounts
ACCOUNT_0="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
PK_0="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Minority Rule Game - Real-Time Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if anvil is running
echo -e "${YELLOW}Checking if Anvil is running...${NC}"
if ! curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1; then
    echo -e "${RED}Anvil is not running. Please start it first.${NC}\n"
    exit 1
fi
echo -e "${GREEN}✓ Anvil is running${NC}\n"

# Use existing contract address (deployed via reset-all.sh)
GAME_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
echo -e "${GREEN}Using contract: $GAME_ADDRESS${NC}\n"

echo -e "${BLUE}=== STEP 1: Creating Game (Account 0) ===${NC}"
GAME_ID=$(cast call $GAME_ADDRESS "nextGameId()(uint256)" --rpc-url http://localhost:8545)
cast send $GAME_ADDRESS "createGame(string,uint256)(uint256)" "Should we continue this experiment?" $ENTRY_FEE \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Game created with ID: $GAME_ID${NC}"
echo -e "Entry fee: 0.1 ETH\n"

echo -e "${BLUE}=== STEP 2: Setting Commit Deadline (${COMMIT_DURATION}s) ===${NC}"
cast send $GAME_ADDRESS "setCommitDeadline(uint256,uint256)" $GAME_ID $COMMIT_DURATION \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Commit deadline set for ${COMMIT_DURATION} seconds${NC}\n"

echo -e "${BLUE}=== STEP 3: Players Joining (Accounts 1-6) ===${NC}"
cast send $GAME_ADDRESS "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE \
    --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 1 joined${NC}"

cast send $GAME_ADDRESS "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE \
    --private-key 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 2 joined${NC}"

cast send $GAME_ADDRESS "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE \
    --private-key 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 3 joined${NC}"

cast send $GAME_ADDRESS "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE \
    --private-key 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 4 joined${NC}"

cast send $GAME_ADDRESS "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE \
    --private-key 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 5 joined${NC}"

cast send $GAME_ADDRESS "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE \
    --private-key 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 6 joined${NC}\n"

echo -e "${BLUE}=== STEP 4: All Players Committing Votes ===${NC}"

# Account 0 joins and commits YES
cast send $GAME_ADDRESS "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 0 joined${NC}"

# Generate commit hashes using abi.encodePacked (bool + bytes32)
# For bool: true=0x01, false=0x00 (1 byte)
# YES voters: 0, 1, 2
SALT_0="0x0000000000000000000000000000000000000000000000000000000000003039"
COMMIT_0=$(cast keccak "0x01${SALT_0:2}")  # true (0x01) + salt
cast send $GAME_ADDRESS "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_0 \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 0 committed (YES)${NC}"

SALT_1="0x0000000000000000000000000000000000000000000000000000000000005ba0"
COMMIT_1=$(cast keccak "0x01${SALT_1:2}")  # true (0x01) + salt
cast send $GAME_ADDRESS "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_1 \
    --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 1 committed (YES)${NC}"

SALT_2="0x0000000000000000000000000000000000000000000000000000000000008707"
COMMIT_2=$(cast keccak "0x01${SALT_2:2}")  # true (0x01) + salt
cast send $GAME_ADDRESS "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_2 \
    --private-key 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 2 committed (YES)${NC}"

# NO voters: 3, 4, 5, 6
SALT_3="0x000000000000000000000000000000000000000000000000000000000000b26e"
COMMIT_3=$(cast keccak "0x00${SALT_3:2}")  # false (0x00) + salt
cast send $GAME_ADDRESS "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_3 \
    --private-key 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 3 committed (NO)${NC}"

SALT_4="0x000000000000000000000000000000000000000000000000000000000000ddd5"
COMMIT_4=$(cast keccak "0x00${SALT_4:2}")  # false (0x00) + salt
cast send $GAME_ADDRESS "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_4 \
    --private-key 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 4 committed (NO)${NC}"

SALT_5="0x000000000000000000000000000000000000000000000000000000000001093a"
COMMIT_5=$(cast keccak "0x00${SALT_5:2}")  # false (0x00) + salt
cast send $GAME_ADDRESS "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_5 \
    --private-key 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 5 committed (NO)${NC}"

SALT_6="0x00000000000000000000000000000000000000000000000000000000000134a5"
COMMIT_6=$(cast keccak "0x00${SALT_6:2}")  # false (0x00) + salt
cast send $GAME_ADDRESS "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_6 \
    --private-key 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 6 committed (NO)${NC}\n"

echo -e "${YELLOW}⏳ Waiting ${COMMIT_DURATION} seconds for commit deadline to pass...${NC}"
sleep $COMMIT_DURATION
echo -e "${GREEN}✓ Commit deadline passed${NC}\n"

echo -e "${BLUE}=== STEP 5: Setting Reveal Deadline (${REVEAL_DURATION}s) ===${NC}"
cast send $GAME_ADDRESS "setRevealDeadline(uint256,uint256)" $GAME_ID $REVEAL_DURATION \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Reveal deadline set for ${REVEAL_DURATION} seconds${NC}\n"

echo -e "${BLUE}=== STEP 6: All Players Revealing Votes ===${NC}"

cast send $GAME_ADDRESS "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_0 \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 0 revealed (YES)${NC}"

cast send $GAME_ADDRESS "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_1 \
    --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 1 revealed (YES)${NC}"

cast send $GAME_ADDRESS "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_2 \
    --private-key 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 2 revealed (YES)${NC}"

cast send $GAME_ADDRESS "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_3 \
    --private-key 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 3 revealed (NO)${NC}"

cast send $GAME_ADDRESS "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_4 \
    --private-key 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 4 revealed (NO)${NC}"

cast send $GAME_ADDRESS "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_5 \
    --private-key 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 5 revealed (NO)${NC}"

cast send $GAME_ADDRESS "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_6 \
    --private-key 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Account 6 revealed (NO)${NC}\n"

echo -e "${YELLOW}⏳ Waiting ${REVEAL_DURATION} seconds for reveal deadline to pass...${NC}"
sleep $REVEAL_DURATION
echo -e "${GREEN}✓ Reveal deadline passed${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓✓✓ SETUP COMPLETE ✓✓✓${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Contract Address:${NC} $GAME_ADDRESS"
echo -e "${YELLOW}Game ID:${NC} $GAME_ID\n"

echo -e "${YELLOW}Vote Summary:${NC}"
echo -e "  ${GREEN}YES votes: 3${NC} (Accounts 0, 1, 2)"
echo -e "  ${RED}NO votes: 4${NC} (Accounts 3, 4, 5, 6)\n"

echo -e "${YELLOW}Expected Result:${NC}"
echo -e "  ${GREEN}Minority (Winners): Accounts 0, 1, 2${NC}\n"

echo -e "${YELLOW}Next Step:${NC}"
echo -e "  Call ${GREEN}processRound($GAME_ID)${NC} from your browser!\n"

echo -e "${BLUE}Cast command to process round:${NC}"
echo -e "cast send $GAME_ADDRESS \"processRound(uint256)\" $GAME_ID \\"
echo -e "  --private-key $PK_0 --rpc-url http://localhost:8545\n"
