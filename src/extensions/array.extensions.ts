interface Array<T> {
  insertAtIndex<T>(index: number, element: T): T[];
}

Array.prototype.insertAtIndex = function <T>(
  this: Array<T>,
  index: number,
  element: T
): T[] {
  let arrayCopy = [...this];

  arrayCopy.splice(index || 0, 0, element);

  return arrayCopy;
};

