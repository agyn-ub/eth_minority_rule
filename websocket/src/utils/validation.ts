import { NotificationPayload, GameEventType } from '../types';

const VALID_EVENT_TYPES: GameEventType[] = [
  'GameCreated',
  'PlayerJoined',
  'VoteCommitted',
  'VoteRevealed',
  'RoundCompleted',
  'GameCompleted',
  'CommitPhaseStarted',
  'RevealPhaseStarted',
];

export function validateNotificationPayload(payload: any): payload is NotificationPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  if (typeof payload.eventType !== 'string' || !VALID_EVENT_TYPES.includes(payload.eventType as GameEventType)) {
    return false;
  }

  if (typeof payload.gameId !== 'string' || !/^\d+$/.test(payload.gameId)) {
    return false;
  }

  if (!payload.data || typeof payload.data !== 'object') {
    return false;
  }

  return true;
}

export function validateGameId(gameId: string): boolean {
  return typeof gameId === 'string' && /^\d+$/.test(gameId);
}

export function validateRoomName(room: string): boolean {
  return typeof room === 'string' && /^(list:(active|completed))$/.test(room);
}
