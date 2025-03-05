import { bold } from "../helpers/discord";

export interface LineField {
  title: string;
  value: string;
}

export interface Line {
  shouldDisplay: boolean | (() => boolean);
  string: string | LineField;
  else?: string;
}

function isLine(line: Line | string | LineField): line is Line {
  return typeof line !== "string" && (line as any).string != undefined;
}

export class LineConsolidator {
  private lines: Line[] = [];

  addLines(
    ...lines: Array<Line | string | LineField | undefined>
  ): LineConsolidator {
    this.lines.push(
      ...lines.map((l) =>
        typeof l === "undefined"
          ? { shouldDisplay: false, string: "" }
          : isLine(l)
          ? l
          : { shouldDisplay: true, string: l }
      )
    );

    return this;
  }

  consolidate(): string {
    return this.lines
      .filter((l) => l.shouldDisplay || !!l.else)
      .map((l) =>
        this.generateLine((l.shouldDisplay ? l.string : l.else) || "")
      )
      .join("\n");
  }

  private generateLine(field: string | LineField): string {
    if (typeof field === "string") {
      return field;
    } else return `${bold(field.title)}: ${field.value}`;
  }
}

export function gap(count: number = 1): string {
  return "\n".repeat(count - 1);
}
