// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {MinorityRuleGame} from "../src/MinorityRuleGame.sol";

/**
 * @title TestSetup
 * @notice Script to set up a test game scenario with 7 players
 * @dev Uses Anvil default accounts 0-6:
 *      - Account 0: Creator and player (votes YES)
 *      - Accounts 1-2: Players voting YES
 *      - Accounts 3-6: Players voting NO
 *      Stops before processRound for manual testing
 */
contract TestSetup is Script {
    // Anvil default accounts
    address constant ACCOUNT_0 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address constant ACCOUNT_1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant ACCOUNT_2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address constant ACCOUNT_3 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
    address constant ACCOUNT_4 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
    address constant ACCOUNT_5 = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
    address constant ACCOUNT_6 = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;

    // Anvil default private keys
    uint256 constant PK_0 = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 constant PK_1 = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 constant PK_2 = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;
    uint256 constant PK_3 = 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6;
    uint256 constant PK_4 = 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a;
    uint256 constant PK_5 = 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba;
    uint256 constant PK_6 = 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e;

    uint256 constant ENTRY_FEE = 0.1 ether;
    uint256 constant COMMIT_DURATION = 180; // 3 minutes
    uint256 constant REVEAL_DURATION = 120; // 2 minutes

    function run() external {
        // Get the deployed contract address from environment or deploy new one
        address gameAddress = vm.envOr("GAME_ADDRESS", address(0));
        MinorityRuleGame game;

        if (gameAddress == address(0)) {
            console.log("No GAME_ADDRESS found, deploying new contract...");
            vm.startBroadcast(PK_0);
            game = new MinorityRuleGame(ACCOUNT_0); // Account 0 as platform recipient
            vm.stopBroadcast();
            console.log("MinorityRuleGame deployed to:", address(game));
        } else {
            game = MinorityRuleGame(gameAddress);
            console.log("Using existing contract at:", address(game));
        }

        console.log("\n=== STEP 1: Creating Game (Account 0) ===");
        vm.startBroadcast(PK_0);
        uint256 gameId = game.createGame("Should we continue this experiment?", ENTRY_FEE);
        console.log("Game created with ID:", gameId);
        console.log("Entry fee:", ENTRY_FEE);
        vm.stopBroadcast();

        console.log("\n=== STEP 2: Setting Commit Deadline (3 minutes) ===");
        vm.startBroadcast(PK_0);
        game.setCommitDeadline(gameId, COMMIT_DURATION);
        console.log("Commit deadline set for 3 minutes from now");
        vm.stopBroadcast();

        console.log("\n=== STEP 3: Players Joining (Accounts 1-6) ===");
        address[6] memory joiningPlayers = [ACCOUNT_1, ACCOUNT_2, ACCOUNT_3, ACCOUNT_4, ACCOUNT_5, ACCOUNT_6];
        uint256[6] memory joiningKeys = [PK_1, PK_2, PK_3, PK_4, PK_5, PK_6];

        for (uint256 i = 0; i < 6; i++) {
            vm.startBroadcast(joiningKeys[i]);
            game.joinGame{value: ENTRY_FEE}(gameId);
            console.log("Account", i + 1, "joined:", joiningPlayers[i]);
            vm.stopBroadcast();
        }

        console.log("\n=== STEP 4: All Players Committing Votes ===");
        // Account 0, 1, 2 vote YES, Accounts 3, 4, 5, 6 vote NO
        bytes32 salt0 = bytes32(uint256(12345));
        bytes32 salt1 = bytes32(uint256(23456));
        bytes32 salt2 = bytes32(uint256(34567));
        bytes32 salt3 = bytes32(uint256(45678));
        bytes32 salt4 = bytes32(uint256(56789));
        bytes32 salt5 = bytes32(uint256(67890));
        bytes32 salt6 = bytes32(uint256(78901));

        // Account 0 commits YES
        vm.startBroadcast(PK_0);
        game.joinGame{value: ENTRY_FEE}(gameId);
        console.log("Account 0 joined:", ACCOUNT_0);
        bytes32 commit0 = keccak256(abi.encodePacked(true, salt0));
        game.submitCommit(gameId, commit0);
        console.log("Account 0 committed (YES)");
        vm.stopBroadcast();

        // Account 1 commits YES
        vm.startBroadcast(PK_1);
        bytes32 commit1 = keccak256(abi.encodePacked(true, salt1));
        game.submitCommit(gameId, commit1);
        console.log("Account 1 committed (YES)");
        vm.stopBroadcast();

        // Account 2 commits YES
        vm.startBroadcast(PK_2);
        bytes32 commit2 = keccak256(abi.encodePacked(true, salt2));
        game.submitCommit(gameId, commit2);
        console.log("Account 2 committed (YES)");
        vm.stopBroadcast();

        // Account 3 commits NO
        vm.startBroadcast(PK_3);
        bytes32 commit3 = keccak256(abi.encodePacked(false, salt3));
        game.submitCommit(gameId, commit3);
        console.log("Account 3 committed (NO)");
        vm.stopBroadcast();

        // Account 4 commits NO
        vm.startBroadcast(PK_4);
        bytes32 commit4 = keccak256(abi.encodePacked(false, salt4));
        game.submitCommit(gameId, commit4);
        console.log("Account 4 committed (NO)");
        vm.stopBroadcast();

        // Account 5 commits NO
        vm.startBroadcast(PK_5);
        bytes32 commit5 = keccak256(abi.encodePacked(false, salt5));
        game.submitCommit(gameId, commit5);
        console.log("Account 5 committed (NO)");
        vm.stopBroadcast();

        // Account 6 commits NO
        vm.startBroadcast(PK_6);
        bytes32 commit6 = keccak256(abi.encodePacked(false, salt6));
        game.submitCommit(gameId, commit6);
        console.log("Account 6 committed (NO)");
        vm.stopBroadcast();

        console.log("\n=== STEP 5: Advancing time past commit deadline ===");
        // Advance time to after commit deadline
        vm.warp(block.timestamp + COMMIT_DURATION + 1);
        console.log("Time advanced past commit deadline");

        console.log("\n=== STEP 6: Setting Reveal Deadline (2 minutes) ===");
        vm.startBroadcast(PK_0);
        game.setRevealDeadline(gameId, REVEAL_DURATION);
        console.log("Reveal deadline set for 2 minutes from now");
        vm.stopBroadcast();

        console.log("\n=== STEP 7: All Players Revealing Votes ===");

        // Account 0 reveals YES
        vm.startBroadcast(PK_0);
        game.submitReveal(gameId, true, salt0);
        console.log("Account 0 revealed (YES)");
        vm.stopBroadcast();

        // Account 1 reveals YES
        vm.startBroadcast(PK_1);
        game.submitReveal(gameId, true, salt1);
        console.log("Account 1 revealed (YES)");
        vm.stopBroadcast();

        // Account 2 reveals YES
        vm.startBroadcast(PK_2);
        game.submitReveal(gameId, true, salt2);
        console.log("Account 2 revealed (YES)");
        vm.stopBroadcast();

        // Account 3 reveals NO
        vm.startBroadcast(PK_3);
        game.submitReveal(gameId, false, salt3);
        console.log("Account 3 revealed (NO)");
        vm.stopBroadcast();

        // Account 4 reveals NO
        vm.startBroadcast(PK_4);
        game.submitReveal(gameId, false, salt4);
        console.log("Account 4 revealed (NO)");
        vm.stopBroadcast();

        // Account 5 reveals NO
        vm.startBroadcast(PK_5);
        game.submitReveal(gameId, false, salt5);
        console.log("Account 5 revealed (NO)");
        vm.stopBroadcast();

        // Account 6 reveals NO
        vm.startBroadcast(PK_6);
        game.submitReveal(gameId, false, salt6);
        console.log("Account 6 revealed (NO)");
        vm.stopBroadcast();

        console.log("\n=== STEP 8: Advancing time past reveal deadline ===");
        // Advance time to after reveal deadline so processRound can be called
        vm.warp(block.timestamp + REVEAL_DURATION + 1);
        console.log("Time advanced past reveal deadline");

        console.log("\n=== SETUP COMPLETE ===");
        console.log("Contract Address:", address(game));
        console.log("Game ID:", gameId);
        console.log("\nVote Summary:");
        console.log("  YES votes: 3 (Accounts 0, 1, 2)");
        console.log("  NO votes: 4 (Accounts 3, 4, 5, 6)");
        console.log("\nMinority will be: YES voters (Accounts 0, 1, 2)");
        console.log("\nReady to test processRound() from browser!");
        console.log("All deadlines have passed and all players have revealed. You can call processRound() immediately!");
    }
}
