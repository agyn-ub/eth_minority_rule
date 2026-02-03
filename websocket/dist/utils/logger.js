"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
function shouldLog(level) {
    return levels[level] >= levels[LOG_LEVEL];
}
function formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}
exports.logger = {
    debug(message, meta) {
        if (shouldLog('debug')) {
            console.log(formatMessage('debug', message, meta));
        }
    },
    info(message, meta) {
        if (shouldLog('info')) {
            console.log(formatMessage('info', message, meta));
        }
    },
    warn(message, meta) {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', message, meta));
        }
    },
    error(message, meta) {
        if (shouldLog('error')) {
            console.error(formatMessage('error', message, meta));
        }
    },
};
//# sourceMappingURL=logger.js.map