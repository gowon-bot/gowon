export interface Line {
  shouldDisplay: boolean;
  string: string;
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
      .filter((l) => l.shouldDisplay)
      .map((l) => l.string)
      .join("\n");
  }
}
