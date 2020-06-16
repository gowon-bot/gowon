export function addS(string: string, number: number) {
  return number === 1 ? string : string + "s";
}

export function numberDisplay(number: number | string, unit?: string): string {
  let parsedNumber = number;

  if (typeof number === "string") {
    parsedNumber = Number(number) || 0;
  }

  return (
    parsedNumber.toLocaleString() +
    (unit ? " " + (parsedNumber === 1 ? unit : unit + "s") : "")
  );
}

export function ucFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
