import { toInt } from "./lastfm/";

export function calculatePercent(
  number1: number | string,
  number2: number | string,
  precision: number = 1
): string {
  if (
    !number2 ||
    isNaN(typeof number2 === "string" ? toInt(number2) : number2) ||
    number2 <= 0
  )
    return "0";

  return parseFloat(
    (
      ((typeof number1 === "number" ? number1 : Number(number1)) /
        (typeof number2 === "number" ? number2 : Number(number2))) *
      100
    ).toFixed(precision)
  ).toLocaleString();
}

// Credit: https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
export function mostCommonOccurrence<T = any>(array: Array<T>): T | undefined {
  return array
    .sort(
      (a, b) =>
        array.filter((v) => v === a).length -
        array.filter((v) => v === b).length
    )
    .pop();
}
