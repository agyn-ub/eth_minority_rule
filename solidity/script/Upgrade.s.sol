// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {MinorityRuleGame} from "../src/MinorityRuleGame.sol";

contract UpgradeScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        console.log("Upgrading MinorityRuleGame...");
        console.log("Proxy address:", proxyAddress);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy new implementation
        MinorityRuleGame newImplementation = new MinorityRuleGame();

        // 2. Upgrade proxy to new implementation
        MinorityRuleGame proxy = MinorityRuleGame(proxyAddress);
        proxy.upgradeToAndCall(address(newImplementation), "");

        vm.stopBroadcast();

        console.log("New implementation deployed to:", address(newImplementation));
        console.log("Proxy upgraded successfully");
        console.log("Owner:", proxy.owner());
        console.log("Next Game ID:", proxy.nextGameId());
    }
}
