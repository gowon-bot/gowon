export class NamedRange {
  constructor(public from: string, public to?: string) {}

  get humanized() {
    if (!this.to) return `in ${this.from}`;

    return `from ${this.from} to ${this.to}`;
  }
}
