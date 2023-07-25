import { discordTimestamp } from "../lib/views/displays";

export function addS(string: string, number: number) {
  return number === 1 ? string : string + "s";
}

export function ago(date: Date): string {
  return discordTimestamp(date, "R");
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

export async function asyncFind<T>(
  array: T[],
  proc: (item: T) => Promise<boolean> | boolean
): Promise<T | undefined> {
  const promises = array.map(proc);
  const results = await Promise.all(promises);
  const index = results.findIndex((result) => result);
  return array[index];
}
