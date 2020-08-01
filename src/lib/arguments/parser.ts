import { Slice, ParsedArgument } from "./arguments";

export abstract class Parser {
  protected removeMentions(string: string): string {
    return string.replace(/<@(!|&|#)?[0-9]+>/g, "");
  }

  protected getElementFromIndex(
    array: Array<any>,
    index: number | Slice,
    join = true,
    defaults?: any | any[]
  ): ParsedArgument {
    if (index === undefined) return undefined;

    if (
      array.length <
      (typeof index === "number" ? index : index.stop || index.start)
    ) {
      return defaults;
    }

    if (typeof index === "number") {
      return (
        (typeof array[index] === "string"
          ? array[index]?.trim()
          : array[index]) || defaults
      );
    } else {
      let slicedArray = (index.stop
        ? array.slice(index.start, index.stop + 1)
        : array.slice(index.start)
      ).map((e) => (typeof e === "string" ? e?.trim() : e));

      if (index.start && index.stop) {
        for (let i = 0; i < index.stop - index.start + 1; i++) {
          if (!slicedArray[i]) slicedArray[i] = (defaults || [])[i];
        }
      } else {
        for (let i = 0; i < defaults?.length; i++) {
          const def = defaults[i];

          if (!slicedArray[i]) slicedArray[i] = def;
        }
      }

      return join ? slicedArray.join(" ") : slicedArray;
    }
  }
}
