/**
 * Squid Game-inspired geometric shapes
 * Used throughout the UI to replace emojis and add visual identity
 */
export const SQUID_SHAPES = {
  circle: '\u25CB',    // ○ - ZeroPhase (Waiting)
  triangle: '\u25B3',  // △ - CommitPhase
  square: '\u25A1',    // □ - RevealPhase
  star: '\u2605',      // ★ - Completed/Winner
} as const;

/**
 * Get the shape corresponding to a game state
 */
export function getGameStateShape(state: string): string {
  switch (state) {
    case 'ZeroPhase':
      return SQUID_SHAPES.circle;
    case 'CommitPhase':
      return SQUID_SHAPES.triangle;
    case 'RevealPhase':
      return SQUID_SHAPES.square;
    case 'Completed':
      return SQUID_SHAPES.star;
    default:
      return SQUID_SHAPES.circle;
  }
}

/**
 * Shape display string for header/branding
 */
export const SQUID_BRAND = `${SQUID_SHAPES.circle} ${SQUID_SHAPES.triangle} ${SQUID_SHAPES.square}`;
