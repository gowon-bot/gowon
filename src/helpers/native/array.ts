export function partition<T>(
  array: T[],
  isValid: (elem: T) => boolean
): [pass: T[], fail: T[]] {
  return array.reduce(
    ([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[] as T[], [] as T[]]
  );
}

export function chunkArray<T = any>(
  array: Array<T>,
  chunkSize: number
): Array<Array<T>> {
  return Array(Math.ceil(array.length / chunkSize))
    .fill(0)
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));
}

export function flatDeep<T = any>(arr: Array<any>, d = Infinity): Array<T> {
  return d > 0
    ? arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
        []
      )
    : (arr.slice() as Array<T>);
}

export function shuffle<T>(a: Array<T>): Array<T> {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function insertAtIndex<T>(
  array: Array<T>,
  index: number,
  element: T
): T[] {
  let arrayCopy = [...array];

  arrayCopy.splice(index || 0, 0, element);

  return arrayCopy;
}
