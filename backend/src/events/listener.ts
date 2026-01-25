import { createPublicClient, http } from 'viem';
import { watchContractEvent } from 'viem/actions';
import { foundry } from 'viem/chains';
import { config } from '../config.js';
import { pool } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { RoomManager } from '../websocket/rooms.js';
import { Broadcaster } from '../websocket/broadcaster.js';

// Import all event handlers
import { handleGameCreated } from './handlers/game-created.js';
import { handlePlayerJoined } from './handlers/player-joined.js';
import { handleVoteCommitted } from './handlers/vote-committed.js';
import { handleVoteRevealed } from './handlers/vote-revealed.js';
import { handleCommitPhaseStarted } from './handlers/commit-phase-started.js';
import { handleRevealPhaseStarted } from './handlers/reveal-phase-started.js';
import { handleRoundCompleted } from './handlers/round-completed.js';
import { handleGameCompleted } from './handlers/game-completed.js';

// Import ABI
import MinorityRuleGameABI from '../../abis/MinorityRuleGame.json' assert { type: 'json' };

export async function startEventListener(roomManager: RoomManager, broadcaster: Broadcaster) {
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(config.blockchain.rpcUrl),
  });

  logger.info(
    {
      rpcUrl: config.blockchain.rpcUrl,
      contractAddress: config.blockchain.contractAddress,
      startBlock: config.blockchain.startBlock.toString(),
    },
    'Starting event listener...'
  );

  // GameCreated
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'GameCreated',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handleGameCreated(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'GameCreated listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  // PlayerJoined
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'PlayerJoined',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handlePlayerJoined(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'PlayerJoined listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  // VoteCommitted
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'VoteCommitted',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handleVoteCommitted(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'VoteCommitted listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  // VoteRevealed
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'VoteRevealed',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handleVoteRevealed(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'VoteRevealed listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  // CommitPhaseStarted
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'CommitPhaseStarted',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handleCommitPhaseStarted(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'CommitPhaseStarted listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  // RevealPhaseStarted
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'RevealPhaseStarted',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handleRevealPhaseStarted(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'RevealPhaseStarted listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  // RoundCompleted
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'RoundCompleted',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handleRoundCompleted(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'RoundCompleted listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  // GameCompleted
  watchContractEvent(publicClient, {
    address: config.blockchain.contractAddress,
    abi: MinorityRuleGameABI,
    eventName: 'GameCompleted',
    onLogs: async (logs: any) => {
      for (const log of logs) {
        await handleGameCompleted(log, pool, roomManager, broadcaster);
      }
    },
    onError: (error: any) => logger.error({ error }, 'GameCompleted listener error'),
    pollingInterval: config.blockchain.pollingInterval,
    fromBlock: config.blockchain.startBlock,
  });

  logger.info('Event listener started successfully - watching all 8 events');
}
