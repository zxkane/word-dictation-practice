export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Word {
  id: string;
  term: string;
  definition: string;
  examples: string[];
  category: string;
  difficulty: Difficulty;
  tags: string[];
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  words: Word[];
}

export interface WordBank {
  id: string;
  name: string;
  numberOfWords: number;
  units: Unit[];
}
