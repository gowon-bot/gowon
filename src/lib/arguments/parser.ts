import { Slice, ParsedArgument } from "./arguments";

export abstract class Parser {
  protected removeMentions(string: string): string {
    return string.replace(/<@(!|&|#)?[0-9]+>/g, "");
  }

  protected getElementFromIndex(
    array: Array<any>,
    index: number | Slice
  ): ParsedArgument {
    if (index === undefined) return undefined;

    if (
      array.length <
      (typeof index === "number" ? index : index.stop || index.start)
    ) {
      return;
    }
    
    return typeof index === "number"
      ? typeof array[index] === "string"
        ? array[index]?.trim()
        : array[index]
      : (index.stop
          ? array.slice(index.start, index.stop + 1)
          : array.slice(index.start)
        )
          .map((e) => (typeof e === "string" ? e?.trim() : e))
          .join(" ");
  }
}
