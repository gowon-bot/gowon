interface Array<T> {
  insert<T>(index: number, element: T): T[];
}

Array.prototype.insert = function <T>(
  this: Array<T>,
  index: number,
  element: T
): T[] {
  let arrayCopy = [...this];

  arrayCopy.splice(index || 0, 0, element);

  return arrayCopy;
};
