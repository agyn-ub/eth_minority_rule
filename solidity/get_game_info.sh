#!/bin/bash

CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
GAME_ID="${1:-1}"

# Run the forge script and capture output
OUTPUT=$(CONTRACT_ADDRESS=$CONTRACT_ADDRESS GAME_ID=$GAME_ID forge script script/GetGameInfo.s.sol --rpc-url http://localhost:8545 2>&1)

# Check if game exists
if echo "$OUTPUT" | grep -q "DOES NOT EXIST"; then
    echo "Game doesn't exist" > game_info.md
    cat game_info.md
else
    echo "$OUTPUT" > game_info.md
    cat game_info.md
fi
