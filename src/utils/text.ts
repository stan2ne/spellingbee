export interface ComparisonResult {
  isMatch: boolean;
  score: number;
  strategy: 'exact' | 'distance' | 'phonetic' | 'none';
}

export const normalizeText = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ');
};

export const levenshteinDistance = (source: string, target: string): number => {
  const sourceLength: number = source.length;
  const targetLength: number = target.length;
  const matrix: number[][] = Array.from({ length: sourceLength + 1 }, () =>
    Array.from({ length: targetLength + 1 }, () => 0)
  );

  for (let rowIndex: number = 0; rowIndex <= sourceLength; rowIndex += 1) {
    matrix[rowIndex][0] = rowIndex;
  }

  for (let columnIndex: number = 0; columnIndex <= targetLength; columnIndex += 1) {
    matrix[0][columnIndex] = columnIndex;
  }

  for (let rowIndex: number = 1; rowIndex <= sourceLength; rowIndex += 1) {
    for (let columnIndex: number = 1; columnIndex <= targetLength; columnIndex += 1) {
      const substitutionCost: number = source[rowIndex - 1] === target[columnIndex - 1] ? 0 : 1;
      const deletion: number = matrix[rowIndex - 1][columnIndex] + 1;
      const insertion: number = matrix[rowIndex][columnIndex - 1] + 1;
      const substitution: number = matrix[rowIndex - 1][columnIndex - 1] + substitutionCost;

      matrix[rowIndex][columnIndex] = Math.min(deletion, insertion, substitution);
    }
  }

  return matrix[sourceLength][targetLength];
};

export const soundex = (value: string): string => {
  const cleanValue: string = normalizeText(value).replace(/\s+/g, '');

  if (cleanValue.length === 0) {
    return '';
  }

  const codeMap: Record<string, string> = {
    b: '1',
    f: '1',
    p: '1',
    v: '1',
    c: '2',
    g: '2',
    j: '2',
    k: '2',
    q: '2',
    s: '2',
    x: '2',
    z: '2',
    d: '3',
    t: '3',
    l: '4',
    m: '5',
    n: '5',
    r: '6'
  };

  const firstLetter: string = cleanValue[0];
  const encoded: string[] = [firstLetter.toUpperCase()];
  let previousCode: string = codeMap[firstLetter] ?? '';

  for (let index: number = 1; index < cleanValue.length; index += 1) {
    const currentCharacter: string = cleanValue[index];
    const currentCode: string = codeMap[currentCharacter] ?? '';

    if (currentCode !== '' && currentCode !== previousCode) {
      encoded.push(currentCode);
    }

    previousCode = currentCode;
  }

  const paddedCode: string = `${encoded.join('')}0000`;
  return paddedCode.slice(0, 4);
};

const calculateDistanceThreshold = (targetWordLength: number): number => {
  if (targetWordLength <= 4) {
    return 1;
  }

  if (targetWordLength <= 6) {
    return 2;
  }

  return 3;
};

export const comparePronunciation = (targetWord: string, spokenWord: string): ComparisonResult => {
  const normalizedTargetWord: string = normalizeText(targetWord);
  const normalizedSpokenWord: string = normalizeText(spokenWord);

  if (normalizedSpokenWord.length === 0 || normalizedTargetWord.length === 0) {
    return { isMatch: false, score: 0, strategy: 'none' };
  }

  if (normalizedSpokenWord === normalizedTargetWord) {
    return { isMatch: true, score: 1, strategy: 'exact' };
  }

  const distance: number = levenshteinDistance(normalizedTargetWord, normalizedSpokenWord);
  const distanceThreshold: number = calculateDistanceThreshold(normalizedTargetWord.length);

  if (distance <= distanceThreshold) {
    const maxLength: number = Math.max(normalizedTargetWord.length, normalizedSpokenWord.length);
    const score: number = Math.max(0, 1 - distance / maxLength);
    return { isMatch: true, score, strategy: 'distance' };
  }

  const targetSoundex: string = soundex(normalizedTargetWord);
  const spokenSoundex: string = soundex(normalizedSpokenWord);

  if (targetSoundex !== '' && targetSoundex === spokenSoundex) {
    return { isMatch: true, score: 0.72, strategy: 'phonetic' };
  }

  return { isMatch: false, score: 0, strategy: 'none' };
};
