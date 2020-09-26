import { Slice, ParsedArgument } from "./arguments";

export abstract class Parser {
  protected removeMentions(string: string): string {
    return string.replace(/<(@|#)(!|&)?[0-9]+>/g, "");
  }

  protected getElementFromIndex(
    array: Array<any>,
    index: number | Slice,
    options: { join?: boolean; default?: any | any[]; number?: boolean } = {}
  ): ParsedArgument {
    if (index === undefined) return undefined;

    options.join = options.join ?? true;

    if (
      array.length <
      (typeof index === "number" ? index : index.stop || index.start)
    ) {
      return options.default;
    }

    let argument: any;

    if (typeof index === "number") {
      argument =
        (typeof array[index] === "string"
          ? array[index]?.trim()
          : array[index]) || options.default;
    } else {
      let slicedArray = (index.stop
        ? array.slice(index.start, index.stop + 1)
        : array.slice(index.start)
      ).map((e) => (typeof e === "string" ? e?.trim() : e));

      if (index.start && index.stop) {
        for (let i = 0; i < index.stop - index.start + 1; i++) {
          if (!slicedArray[i]) slicedArray[i] = (options.default || [])[i];
        }
      } else {
        for (let i = 0; i < options.default?.length; i++) {
          const def = options.default[i];

          if (!slicedArray[i]) slicedArray[i] = def;
        }
      }

      slicedArray = slicedArray.filter((e) => !!e);

      argument = options.join ? slicedArray.join(" ") : slicedArray;
    }

    if (options.number) {
      if (typeof argument === "string")
        return isNaN(argument.toInt()) ? options.default : argument.toInt();
      else return parseInt(argument) ?? options.default;
    } else return argument ?? options.default;
  }
}
