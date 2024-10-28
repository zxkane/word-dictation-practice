import { WordBank } from '@/types/wordBank';

export function getWordBank(wordBankPath: string): WordBank {
  const wordBank = require(`@/data/${wordBankPath}`);
  return wordBank;
}

export function getWordBankPath(wordBankId: string): string {
  return wordBankPaths[wordBankId];
}

const wordBankPaths: { [key: string]: string } = {
  'example-1': 'example/wordBank.json',
  'pep-3-1': '人教 PEP/3年级上.json',
};

export const exampleWordBank: WordBank = getWordBank(getWordBankPath('example-1'));

export const grade3FirstSemester: WordBank = getWordBank(getWordBankPath('pep-3-1'));