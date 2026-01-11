import { createConfig } from "@ponder/core";
import { http } from "viem";
import { foundry, baseSepolia } from "viem/chains";

import MinorityRuleGameABI from "./abis/MinorityRuleGame.json";

export default createConfig({
  networks: {
    anvil: {
      chainId: 31337,
      transport: http("http://127.0.0.1:8545"),
    },
    // Commented out for local development - uncomment when deploying to testnet
    // baseSepolia: {
    //   chainId: 84532,
    //   transport: http(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
    // },
  },
  contracts: {
    MinorityRuleGame: {
      network: {
        anvil: {
          address: process.env.CONTRACT_ADDRESS_ANVIL as `0x${string}`,
          startBlock: Number(process.env.START_BLOCK_ANVIL || 0),
        },
        // Commented out for local development - uncomment when deploying to testnet
        // baseSepolia: {
        //   address: process.env.CONTRACT_ADDRESS_BASE_SEPOLIA as `0x${string}`,
        //   startBlock: Number(process.env.START_BLOCK_BASE_SEPOLIA || 0),
        // },
      },
      abi: MinorityRuleGameABI,
    },
  },
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL!,
  },
});
