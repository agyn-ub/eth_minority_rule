// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {MinorityRuleGame} from "../src/MinorityRuleGame.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployFromAccount0Script is Script {
    function run() external returns (MinorityRuleGame) {
        // Anvil Account 0
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployerAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        console.log("===========================================");
        console.log("Deploying MinorityRuleGame (UUPS Proxy) from Account 0");
        console.log("===========================================");
        console.log("Deployer:", deployerAddress);
        console.log("Platform Fee Recipient:", deployerAddress);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy implementation
        MinorityRuleGame implementation = new MinorityRuleGame();

        // 2. Deploy proxy with initializer
        bytes memory initData = abi.encodeWithSelector(
            MinorityRuleGame.initialize.selector,
            deployerAddress,
            deployerAddress
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);

        vm.stopBroadcast();

        MinorityRuleGame game = MinorityRuleGame(address(proxy));

        console.log("Implementation deployed to:", address(implementation));
        console.log("Proxy deployed to:", address(proxy));
        console.log("Platform Fee: 2%");
        console.log("Creator Fee: 3%");
        console.log("Next Game ID:", game.nextGameId());
        console.log("===========================================");

        return game;
    }
}
