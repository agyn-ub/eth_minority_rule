import 'dotenv/config';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  database: {
    url: process.env.DATABASE_URL!,
  },
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
    contractAddress: process.env.CONTRACT_ADDRESS_ANVIL as `0x${string}`,
    startBlock: BigInt(process.env.START_BLOCK_ANVIL || '0'),
    chainId: 31337, // Anvil
    confirmations: 1, // Anvil: 1, Production: 3-5
    pollingInterval: 1000, // 1 second
  },
  websocket: {
    heartbeatInterval: 30_000, // 30s
  },
};
