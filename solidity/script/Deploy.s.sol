// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {MinorityRuleGame} from "../src/MinorityRuleGame.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployScript is Script {
    function run() external returns (MinorityRuleGame) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address platformRecipient = vm.envOr("PLATFORM_RECIPIENT", deployer);
        address owner = vm.envOr("OWNER", deployer);

        console.log("Deploying MinorityRuleGame (UUPS Proxy)...");
        console.log("Deployer:", deployer);
        console.log("Platform Fee Recipient:", platformRecipient);
        console.log("Owner:", owner);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy implementation contract
        MinorityRuleGame implementation = new MinorityRuleGame();

        // 2. Encode the initialize() call
        bytes memory initData = abi.encodeWithSelector(
            MinorityRuleGame.initialize.selector,
            platformRecipient,
            owner
        );

        // 3. Deploy ERC1967Proxy with implementation + initializer
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        vm.stopBroadcast();

        // Cast proxy address to MinorityRuleGame interface
        MinorityRuleGame game = MinorityRuleGame(address(proxy));

        console.log("Implementation deployed to:", address(implementation));
        console.log("Proxy deployed to:", address(proxy));
        console.log("Platform Fee: 2%");
        console.log("Creator Fee: 3%");
        console.log("Owner:", game.owner());
        console.log("Next Game ID:", game.nextGameId());

        return game;
    }
}
