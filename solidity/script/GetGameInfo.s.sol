// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {MinorityRuleGame} from "../src/MinorityRuleGame.sol";

contract GetGameInfoScript is Script {
    function run() external view {
        // Contract address (update this with your deployed contract)
        address contractAddress = vm.envOr(
            "CONTRACT_ADDRESS",
            address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
        );

        // Game ID to query (default: 1)
        uint256 gameId = vm.envOr("GAME_ID", uint256(1));

        MinorityRuleGame game = MinorityRuleGame(contractAddress);

        console.log("===========================================");
        console.log("GAME INFORMATION");
        console.log("===========================================");
        console.log("Contract:", contractAddress);
        console.log("Game ID:", gameId);
        console.log("");

        // Get game info
        (
            uint256 id,
            string memory questionText,
            uint256 entryFee,
            address creator,
            MinorityRuleGame.GameState state,
            uint8 currentRound,
            uint32 totalPlayers,
            uint32 currentYesVotes,
            uint32 currentNoVotes,
            uint256 prizePool,
            uint256 commitDeadline,
            uint256 revealDeadline,
            address[] memory players,
            address[] memory remainingPlayers,
            address[] memory winners
        ) = game.getGameInfo(gameId);

        // Display basic info
        console.log("Question:", questionText);
        console.log("Entry Fee:", entryFee, "wei");
        console.log("Creator:", creator);
        console.log("State:", _stateToString(state));
        console.log("Current Round:", currentRound);
        console.log("Total Players:", totalPlayers);
        console.log("");

        // Display current round voting
        console.log("Current Round Votes:");
        console.log("  YES:", currentYesVotes);
        console.log("  NO:", currentNoVotes);
        console.log("");

        // Display prize pool
        console.log("Prize Pool:", prizePool, "wei");
        console.log("Prize Pool (ETH):", prizePool / 1e18);
        console.log("");

        // Display deadlines
        if (commitDeadline > 0) {
            console.log("Commit Deadline:", commitDeadline);
            console.log(
                "  Time until deadline:",
                commitDeadline > block.timestamp
                    ? commitDeadline - block.timestamp
                    : 0,
                "seconds"
            );
        }
        if (revealDeadline > 0) {
            console.log("Reveal Deadline:", revealDeadline);
            console.log(
                "  Time until deadline:",
                revealDeadline > block.timestamp
                    ? revealDeadline - block.timestamp
                    : 0,
                "seconds"
            );
        }
        console.log("");

        // Display players
        console.log("All Players (", players.length, "):");
        for (uint256 i = 0; i < players.length; i++) {
            console.log("  ", i + 1, ":", players[i]);
        }
        console.log("");

        // Display remaining players
        console.log("Remaining Players (", remainingPlayers.length, "):");
        for (uint256 i = 0; i < remainingPlayers.length; i++) {
            console.log("  ", i + 1, ":", remainingPlayers[i]);
        }
        console.log("");

        // Display winners
        if (winners.length > 0) {
            console.log("Winners (", winners.length, "):");
            for (uint256 i = 0; i < winners.length; i++) {
                console.log("  ", i + 1, ":", winners[i]);
            }
        } else {
            console.log("Winners: None yet");
        }

        console.log("===========================================");
    }

    function _stateToString(
        MinorityRuleGame.GameState state
    ) internal pure returns (string memory) {
        if (state == MinorityRuleGame.GameState.ZeroPhase) return "ZeroPhase";
        if (state == MinorityRuleGame.GameState.CommitPhase)
            return "CommitPhase";
        if (state == MinorityRuleGame.GameState.RevealPhase)
            return "RevealPhase";
        if (state == MinorityRuleGame.GameState.Completed) return "Completed";
        return "Unknown";
    }
}
