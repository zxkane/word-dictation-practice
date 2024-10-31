export type PlaySpeedOption = {
  label: string;
  value: number;
};

export const PLAY_SPEEDS: PlaySpeedOption[] = [
  { label: 'slowest', value: 0.2 },
  { label: 'slow', value: 0.6 },
  { label: 'normal', value: 1.0 },
  { label: 'quick', value: 1.5 },
];

export const DEFAULT_PLAY_SPEED = PLAY_SPEEDS.find(speed => speed.label === 'normal')!;

export const STORAGE_KEYS = {
  SHOW_HINTS: 'showHints',
  PLAY_TIMES: 'playTimes',
  PLAY_SPEED: 'playSpeed'
} as const;

// You can add other configuration constants here in the future 