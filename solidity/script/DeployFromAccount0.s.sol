// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {MinorityRuleGame} from "../src/MinorityRuleGame.sol";

contract DeployFromAccount0Script is Script {
    function run() external returns (MinorityRuleGame) {
        // Anvil Account 0
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployerAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        console.log("===========================================");
        console.log("Deploying MinorityRuleGame from Account 0");
        console.log("===========================================");
        console.log("Deployer:", deployerAddress);
        console.log("Platform Fee Recipient:", deployerAddress);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        MinorityRuleGame game = new MinorityRuleGame(deployerAddress);

        vm.stopBroadcast();

        console.log("MinorityRuleGame deployed to:", address(game));
        console.log("Platform Fee: 2%");
        console.log("Next Game ID:", game.nextGameId());
        console.log("===========================================");

        return game;
    }
}
