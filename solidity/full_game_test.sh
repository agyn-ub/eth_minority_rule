#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ENTRY_FEE="0.1ether"

# Account private keys
PK_0="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK_1="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK_2="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
PK_3="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
PK_4="0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
PK_5="0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
PK_6="0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  FULL MINORITY RULE GAME TEST${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Create game
echo -e "${YELLOW}Creating new game...${NC}"
GAME_ID=$(cast call $CONTRACT "nextGameId()(uint256)" --rpc-url http://localhost:8545)
cast send $CONTRACT "createGame(string,uint256)(uint256)" "Full test game - who will win?" $ENTRY_FEE \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Game created with ID: $GAME_ID${NC}\n"

# Set commit deadline BEFORE players join
echo -e "${YELLOW}Setting commit deadline (10s)...${NC}"
cast send $CONTRACT "setCommitDeadline(uint256,uint256)" $GAME_ID 10 \
    --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Commit deadline set${NC}\n"

# ==================== ROUND 1 ====================
echo -e "${BLUE}=== ROUND 1: 7 Players ===${NC}"

# Players join (accounts 1-6 first, then account 0)
echo -e "${YELLOW}Players joining...${NC}"
cast send $CONTRACT "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE --private-key $PK_1 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE --private-key $PK_2 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE --private-key $PK_3 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE --private-key $PK_4 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE --private-key $PK_5 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE --private-key $PK_6 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "joinGame(uint256)" $GAME_ID --value $ENTRY_FEE --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ 7 players joined${NC}\n"

# Commits - 3 YES, 4 NO
echo -e "${YELLOW}Round 1 Commits (3 YES, 4 NO - YES wins)...${NC}"
SALT_0_R1="0x1111111111111111111111111111111111111111111111111111111111111111"
COMMIT_0_R1=$(cast keccak "0x01${SALT_0_R1:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_0_R1 --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null

SALT_1_R1="0x2222222222222222222222222222222222222222222222222222222222222222"
COMMIT_1_R1=$(cast keccak "0x01${SALT_1_R1:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_1_R1 --private-key $PK_1 --rpc-url http://localhost:8545 > /dev/null

SALT_2_R1="0x3333333333333333333333333333333333333333333333333333333333333333"
COMMIT_2_R1=$(cast keccak "0x01${SALT_2_R1:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_2_R1 --private-key $PK_2 --rpc-url http://localhost:8545 > /dev/null

SALT_3_R1="0x4444444444444444444444444444444444444444444444444444444444444444"
COMMIT_3_R1=$(cast keccak "0x00${SALT_3_R1:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_3_R1 --private-key $PK_3 --rpc-url http://localhost:8545 > /dev/null

SALT_4_R1="0x5555555555555555555555555555555555555555555555555555555555555555"
COMMIT_4_R1=$(cast keccak "0x00${SALT_4_R1:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_4_R1 --private-key $PK_4 --rpc-url http://localhost:8545 > /dev/null

SALT_5_R1="0x6666666666666666666666666666666666666666666666666666666666666666"
COMMIT_5_R1=$(cast keccak "0x00${SALT_5_R1:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_5_R1 --private-key $PK_5 --rpc-url http://localhost:8545 > /dev/null

SALT_6_R1="0x7777777777777777777777777777777777777777777777777777777777777777"
COMMIT_6_R1=$(cast keccak "0x00${SALT_6_R1:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_6_R1 --private-key $PK_6 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ All commits submitted${NC}\n"

echo -e "${YELLOW}Waiting for commit deadline to pass (10s)...${NC}"
sleep 10

# Set reveal deadline
echo -e "${YELLOW}Setting reveal deadline (10s)...${NC}"
cast send $CONTRACT "setRevealDeadline(uint256,uint256)" $GAME_ID 10 --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Reveal deadline set${NC}\n"

# Reveals
echo -e "${YELLOW}Revealing votes...${NC}"
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_0_R1 --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_1_R1 --private-key $PK_1 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_2_R1 --private-key $PK_2 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_3_R1 --private-key $PK_3 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_4_R1 --private-key $PK_4 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_5_R1 --private-key $PK_5 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_6_R1 --private-key $PK_6 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ All reveals submitted${NC}\n"

echo -e "${YELLOW}Waiting for reveal deadline to pass (10s)...${NC}"
sleep 10

echo -e "${YELLOW}Waiting for indexer to process reveals...${NC}"
sleep 3

echo -e "${YELLOW}Processing Round 1...${NC}"
cast send $CONTRACT "processRound(uint256)" $GAME_ID --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Round 1 completed - 4 NO voters eliminated, 3 YES voters survive${NC}\n"

sleep 2

# ==================== ROUND 2 ====================
echo -e "${BLUE}=== ROUND 2: 3 Players Remaining ===${NC}"
echo -e "${YELLOW}Survivors: Accounts 0, 1, 2 (all voted YES)${NC}\n"

echo -e "${YELLOW}Setting commit deadline (10s)...${NC}"
cast send $CONTRACT "setCommitDeadline(uint256,uint256)" $GAME_ID 10 --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Commit deadline set${NC}\n"

# Commits - 2 YES, 1 NO
echo -e "${YELLOW}Round 2 Commits (2 YES, 1 NO - NO wins)...${NC}"
SALT_0_R2="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
COMMIT_0_R2=$(cast keccak "0x01${SALT_0_R2:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_0_R2 --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null

SALT_1_R2="0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
COMMIT_1_R2=$(cast keccak "0x01${SALT_1_R2:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_1_R2 --private-key $PK_1 --rpc-url http://localhost:8545 > /dev/null

SALT_2_R2="0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
COMMIT_2_R2=$(cast keccak "0x00${SALT_2_R2:2}")
cast send $CONTRACT "submitCommit(uint256,bytes32)" $GAME_ID $COMMIT_2_R2 --private-key $PK_2 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ All commits submitted${NC}\n"

echo -e "${YELLOW}Waiting for commit deadline to pass (10s)...${NC}"
sleep 10

echo -e "${YELLOW}Setting reveal deadline (10s)...${NC}"
cast send $CONTRACT "setRevealDeadline(uint256,uint256)" $GAME_ID 10 --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Reveal deadline set${NC}\n"

echo -e "${YELLOW}Revealing votes...${NC}"
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_0_R2 --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID true $SALT_1_R2 --private-key $PK_1 --rpc-url http://localhost:8545 > /dev/null
cast send $CONTRACT "submitReveal(uint256,bool,bytes32)" $GAME_ID false $SALT_2_R2 --private-key $PK_2 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ All reveals submitted${NC}\n"

echo -e "${YELLOW}Waiting for reveal deadline to pass (10s)...${NC}"
sleep 10

echo -e "${YELLOW}Waiting for indexer to process reveals...${NC}"
sleep 3

echo -e "${YELLOW}Processing Round 2...${NC}"
cast send $CONTRACT "processRound(uint256)" $GAME_ID --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Round 2 completed - 2 YES voters eliminated${NC}"
echo -e "${GREEN}✓ WINNER: Account 2 (0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc)${NC}\n"

sleep 2

# ==================== PAYOUT ====================
echo -e "${BLUE}=== PAYING OUT WINNER ===${NC}"
echo -e "${YELLOW}Paying winner...${NC}"
cast send $CONTRACT "payWinner(uint256)" $GAME_ID --private-key $PK_0 --rpc-url http://localhost:8545 > /dev/null
echo -e "${GREEN}✓ Winner paid!${NC}\n"

# Get final game state
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GAME COMPLETE!${NC}"
echo -e "${BLUE}========================================${NC}\n"

WINNER=$(cast call $CONTRACT "getWinner(uint256)(address)" $GAME_ID --rpc-url http://localhost:8545)
PRIZE=$(cast call $CONTRACT "games(uint256)(string,uint256,uint256,address,uint8,uint256,uint256,uint256,bool)" $GAME_ID --rpc-url http://localhost:8545 | sed -n '2p' | xargs)

echo -e "${GREEN}Winner: ${WINNER}${NC}"
echo -e "${GREEN}Prize Pool: ${PRIZE} wei (0.7 ETH)${NC}"
echo -e "${GREEN}Entry Fee: 0.1 ETH${NC}"
echo -e "${GREEN}Total Players: 7${NC}"
echo -e "${GREEN}Rounds Played: 2${NC}\n"

echo -e "${YELLOW}Round 1:${NC} 7 players → 3 YES (minority) survive, 4 NO eliminated"
echo -e "${YELLOW}Round 2:${NC} 3 players → 1 NO (minority) wins, 2 YES eliminated\n"

echo -e "${GREEN}🎉 Account 2 wins by being the minority voter! 🎉${NC}\n"
