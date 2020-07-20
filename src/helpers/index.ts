import moment from "moment";

export function addS(string: string, number: number) {
  return number === 1 ? string : string + "s";
}

export function numberDisplay(
  number: number | string,
  unit?: string,
  noSpace = false
): string {
  let parsedNumber = number;

  if (typeof number === "string") {
    parsedNumber = Number(number) || 0;
  }

  return (
    parsedNumber.toLocaleString() +
    (unit
      ? (noSpace ? "" : " ") + (parsedNumber === 1 ? unit : unit + "s")
      : "")
  );
}

export function dateDisplay(date: Date): string {
  return moment(date).format("dddd, MMMM Do, YYYY");
}

export function ago(date: Date): string {
  return moment(date).fromNow();
}

export function ucFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function chunkArray(
  array: Array<any>,
  chunkSize: number
): Array<Array<any>> {
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

export function getOrdinal(number: number): string {
  let ordinals = [
    "th",
    "st",
    "nd",
    "rd",
    "th",
    "th",
    "th",
    "th",
    "th",
    "th",
    "th",
  ];

  return (
    number + ordinals[`${number}`.charAt(`${number}`.length - 1).toInt()]
  );
}
