import { format, formatDistanceToNow } from "date-fns";

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

export function abbreviateNumber(number: number | string) {
  const abbreviations = ["k", "m", "b", "t"];

  let convertedNumber = typeof number === "string" ? number.toInt() : number;

  let result = "";

  for (var i = abbreviations.length - 1; i >= 0; i--) {
    // Convert array index to "1000", "1000000", etc
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      convertedNumber = Math.round(convertedNumber / size);

      // Handle special case where we round up to the next abbreviation
      if (convertedNumber == 1000 && i < abbreviations.length - 1) {
        convertedNumber = 1;
        i++;
      }

      // Add the letter for the abbreviation
      result += convertedNumber + abbreviations[i];

      // We are done... stop
      break;
    }
  }

  return result;
}

export function dateDisplay(date: Date): string {
  return format(date, "MMMM do, yyyy");
}

export function dateTimeDisplay(date: Date | undefined): string {
  if (!date) return "";
  return format(date, "h:mma 'on' MMMM do, yyyy");
}

export function ago(date: Date): string {
  return formatDistanceToNow(date) + " ago";
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
  if (`${number}`.endsWith("11")) return numberDisplay(number) + "th";
  if (`${number}`.endsWith("12")) return numberDisplay(number) + "th";

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
    numberDisplay(number) +
    ordinals[`${number}`.charAt(`${number}`.length - 1).toInt()]
  );
}

export function shuffle<T>(a: Array<T>): Array<T> {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class StringPadder {
  longestString = 0;

  constructor(public stringFunction: (item: any) => string) {
    this.stringFunction = stringFunction;
  }

  maxLength(items: any[]): number {
    return items.reduce(
      (acc, val) =>
        this.stringFunction(val).length > acc
          ? this.stringFunction(val).length
          : acc,
      0
    );
  }

  generatedPaddedList(
    items: any[],
    left = false,
    hardLimit?: number
  ): string[] {
    let limit =
      hardLimit ||
      items.reduce(
        (acc, val) =>
          this.stringFunction(val).length > acc
            ? this.stringFunction(val).length
            : acc,
        0
      );

    return items.map((val) => {
      return left
        ? " ".repeat(limit - this.stringFunction(val).length) +
            this.stringFunction(val)
        : this.stringFunction(val) +
            " ".repeat(limit - this.stringFunction(val).length);
    });
  }
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
