import type { CSSProperties } from 'react';

export type ModeId =
  | 'grayscale'
  | 'feed-blur'
  | 'tweet-spacing'
  | 'font-cycling'
  | 'break-cards'
  | 'passive-tracking'
  | 'off';

export interface ModeMeta {
  id: ModeId;
  name: string;
  description: string;
  longDescription: string;
}

export const modes: Record<ModeId, ModeMeta> = {
  grayscale: {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Feed gradually loses color',
    longDescription:
      'Over the course of your daily budget, color drains out of the feed. A quiet way to notice how long you\'ve been here.',
  },
  'feed-blur': {
    id: 'feed-blur',
    name: 'Feed blur',
    description: 'Feed softens over time',
    longDescription:
      'Posts gently lose focus as your session runs. Your eyes will start to do the work they normally don\'t.',
  },
  'tweet-spacing': {
    id: 'tweet-spacing',
    name: 'Tweet spacing',
    description: 'Posts spread apart over time',
    longDescription:
      'As you scroll, the space between posts grows. The timeline loosens its grip.',
  },
  'font-cycling': {
    id: 'font-cycling',
    name: 'Font cycling',
    description: 'Alternates serif and sans',
    longDescription:
      'Body text rotates through typefaces more often as the session goes on. You start to notice the words as shapes.',
  },
  'break-cards': {
    id: 'break-cards',
    name: 'Break cards',
    description: 'Soft pauses between posts',
    longDescription:
      'Small pause cards appear more often as time passes. Quiet check-ins, nothing to do.',
  },
  'passive-tracking': {
    id: 'passive-tracking',
    name: 'Passive tracking',
    description: 'No visual changes, just notices',
    longDescription:
      'The feed looks normal. Only the timer moves — so you can see how long you\'ve been here, later.',
  },
  off: {
    id: 'off',
    name: 'No styles applied',
    description: 'Feed as-is',
    longDescription:
      'Nothing added, nothing tracked. Just the app.',
  },
};

/**
 * Returns CSS filter styles for a given mode at a given progress (0..1).
 * Used for the actual feed view AND for the icon reflection on the Sessions page.
 */
export function getModeFilter(mode: ModeId, progress: number): CSSProperties {
  const p = Math.max(0, Math.min(1, progress));
  switch (mode) {
    case 'grayscale':
      return { filter: `grayscale(${p * 100}%)` };
    case 'feed-blur':
      return { filter: `blur(${p * 0.94}px)` };
    default:
      return {};
  }
}

/**
 * Extra per-post spacing (in px) introduced by the tweet-spacing mode as
 * progress advances. Used by SessionAppScreen only.
 */
export function getExtraGap(mode: ModeId, progress: number): number {
  if (mode !== 'tweet-spacing') return 0;
  const p = Math.max(0, Math.min(1, progress));
  return Math.round(p * 72);
}

/**
 * How often (every N posts) a break card should be inserted. Starts at 0
 * (never) and rises with progress. Returns 0 to mean "don't insert".
 */
export function getBreakCardFrequency(mode: ModeId, _progress: number): number {
  if (mode !== 'break-cards') return 0;
  return 4;
}

/**
 * For font-cycling: how often the font should flip. Returns 0 for never.
 */
export function getFontCycleFrequency(mode: ModeId, _progress: number): number {
  if (mode !== 'font-cycling') return 0;
  return 12;
}

export function formatMinutes(totalMs: number): string {
  const totalSec = Math.floor(totalMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  if (min < 60) return `${min}m ${sec.toString().padStart(2, '0')}s`;
  const hr = Math.floor(min / 60);
  const rem = min % 60;
  return `${hr}h ${rem}m`;
}
