export interface Line {
  shouldDisplay: boolean;
  string: string;
  else?: string;
}

export class LineConsolidator {
  private lines: Line[] = [];

  addLines(...lines: Array<Line | string>) {
    this.lines.push(
      ...lines.map((l) =>
        typeof l === "string" ? { shouldDisplay: true, string: l } : l
      )
    );
  }

  consolidate(): string {
    return this.lines
      .filter((l) => l.shouldDisplay || !!l.else)
      .map((l) => (l.shouldDisplay ? l.string : l.else) || "")
      .join("\n");
  }
}
