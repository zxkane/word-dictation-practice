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
  PLAY_SPEED: 'playSpeed',
  VOICE_GENDER: 'voiceGender'
} as const;

export const VOICE_GENDER_OPTIONS = {
  ALL: 'all',
  MALE: 'male',
  FEMALE: 'female'
} as const;

export type VoiceGenderOption = typeof VOICE_GENDER_OPTIONS[keyof typeof VOICE_GENDER_OPTIONS];

export const VOICE_GENDER_LABELS: Record<VoiceGenderOption, string> = {
  [VOICE_GENDER_OPTIONS.ALL]: 'All',
  [VOICE_GENDER_OPTIONS.MALE]: 'Male',
  [VOICE_GENDER_OPTIONS.FEMALE]: 'Female'
} as const;

// Voice options using the existing constants
export type VoiceOption = {
  label: VoiceGenderOption;
  value: VoiceGenderOption;
  icon: string;
  description: string;
};

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    label: VOICE_GENDER_OPTIONS.ALL,
    value: VOICE_GENDER_OPTIONS.ALL,
    icon: '👥',
    description: VOICE_GENDER_LABELS[VOICE_GENDER_OPTIONS.ALL]
  },
  {
    label: VOICE_GENDER_OPTIONS.MALE,
    value: VOICE_GENDER_OPTIONS.MALE,
    icon: '👨',
    description: VOICE_GENDER_LABELS[VOICE_GENDER_OPTIONS.MALE]
  },
  {
    label: VOICE_GENDER_OPTIONS.FEMALE,
    value: VOICE_GENDER_OPTIONS.FEMALE,
    icon: '👩',
    description: VOICE_GENDER_LABELS[VOICE_GENDER_OPTIONS.FEMALE]
  }
] as const;

export const DEFAULT_VOICE = VOICE_OPTIONS[0];

// You can add other configuration constants here in the future 