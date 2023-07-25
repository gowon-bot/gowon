import { displayNumber } from "../../lib/views/displays";

export function toInt(number: any): number {
  if (typeof number === "number") {
    return number;
  } else if (typeof number === "string") {
    return parseInt(number.replaceAll(/(\s|,)+/g, ""), 10);
  }

  return parseInt(number, 10);
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

export function abbreviateNumber(number: number | string) {
  const abbreviations = ["k", "m", "b", "t"];

  let convertedNumber = typeof number === "string" ? toInt(number) : number;

  let result = "";

  for (var i = abbreviations.length - 1; i >= 0; i--) {
    // Convert array index to "1000", "1000000", etc
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= convertedNumber) {
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
