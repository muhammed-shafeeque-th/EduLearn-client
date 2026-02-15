import { isEqual } from './is-equal';

export function hasChanged<T>(
  original: T | null,
  current: T,
  keysToCompare?: (keyof T)[]
): boolean {
  if (!original) return true;

  if (keysToCompare && keysToCompare.length > 0) {
    const origSubset = pickKeys(original, keysToCompare);
    const currSubset = pickKeys(current, keysToCompare);
    return !isEqual(origSubset, currSubset);
  }

  return !isEqual(original, current);
}

function pickKeys<T>(obj: T, keys: (keyof T)[]): Partial<T> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Partial<T>);
}
