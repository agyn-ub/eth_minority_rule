"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationPayload = validateNotificationPayload;
exports.validateGameId = validateGameId;
exports.validateRoomName = validateRoomName;
const VALID_EVENT_TYPES = [
    'GameCreated',
    'PlayerJoined',
    'VoteCommitted',
    'VoteRevealed',
    'RoundCompleted',
    'GameCompleted',
    'CommitPhaseStarted',
    'RevealPhaseStarted',
];
function validateNotificationPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return false;
    }
    if (typeof payload.eventType !== 'string' || !VALID_EVENT_TYPES.includes(payload.eventType)) {
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
function validateGameId(gameId) {
    return typeof gameId === 'string' && /^\d+$/.test(gameId);
}
function validateRoomName(room) {
    return typeof room === 'string' && /^(list:(active|completed))$/.test(room);
}
//# sourceMappingURL=validation.js.map