import { displayNumber } from "../lib/views/displays";
import { toInt } from "./lastFM";
import { discordTimestamp } from "../lib/views/displays";

export function addS(string: string, number: number) {
  return number === 1 ? string : string + "s";
}

export function abbreviateNumber(number: number | string) {
  const abbreviations = ["k", "m", "b", "t"];

  let convertedNumber = typeof number === "string" ? toInt(number) : number;

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

  return result || displayNumber(number);
}

export function ago(date: Date): string {
  return discordTimestamp(date, "R");
}

export function ucFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
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

export function getOrdinal(number: number): string {
  if (`${number}`.endsWith("11")) return displayNumber(number) + "th";
  if (`${number}`.endsWith("12")) return displayNumber(number) + "th";
  if (`${number}`.endsWith("13")) return displayNumber(number) + "th";

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
    displayNumber(number) +
    ordinals[toInt(`${number}`.charAt(`${number}`.length - 1))]
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

type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never;

type PromiseAllSettledResult<T extends Promise<any>[]> = {
  [V in keyof T]: {
    status: "rejected" | "fulfilled";
    // @ts-ignore (for some reason this errors, despite typescript inferring the types correctly)
    value?: UnwrapPromise<T[V]>;
  };
};

export async function promiseAllSettled<T extends Promise<any>[]>(
  promises: [...T]
): Promise<PromiseAllSettledResult<T>> {
  return (await Promise.allSettled(promises)) as any;
}

export class Stopwatch {
  private startTime?: bigint;
  private endTime?: bigint;

  /**
   * @return The amount of time passed in nanoseconds and 0 if it hasn't started
   */
  get elapsedInNanoseconds(): number {
    if (!this.startTime) return 0;

    const endTime = this.endTime || this.now();

    return Number(endTime - this.startTime);
  }

  /**
   * @return The amount of time passed in milliseconds and 0 if it hasn't started
   */
  get elapsedInMilliseconds(): number {
    return this.elapsedInNanoseconds / 1e6;
  }

  /**
   * @return The amount of time passed in seconds and 0 if it hasn't started
   */
  get elapsedInSeconds(): number {
    return this.elapsedInNanoseconds / 1e9;
  }

  start() {
    this.startTime = this.now();
    return this;
  }

  stop() {
    this.endTime = this.now();
    return this;
  }

  zero() {
    this.startTime = undefined;
    this.endTime = undefined;
    return this;
  }

  now() {
    return process.hrtime.bigint();
  }
}

export function isNumeric(value: string): boolean {
  return /^-?\d+$/.test(value);
}

export async function asyncMap<T, U>(
  array: T[],
  proc: (item: T, index: number) => Promise<U> | U
): Promise<U[]> {
  return await Promise.all(array.map((item, idx) => proc(item, idx)));
}

export async function asyncFilter<T>(
  array: T[],
  proc: (item: T) => Promise<boolean> | boolean
): Promise<T[]> {
  const fail = Symbol();

  return (
    await Promise.all(
      array.map(async (item) =>
        (await Promise.resolve(proc(item))) ? item : fail
      )
    )
  ).filter((i) => i !== fail) as T[];
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
