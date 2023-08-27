import { GowonContext } from "../../../lib/context/Context";

export abstract class IntervaledJob {
  abstract intervalInSeconds: number;
  abstract run(ctx: GowonContext): void | Promise<void>;

  getInterval(): number {
    return this.intervalInSeconds * 1000;
  }

  setTimeout(ctx: GowonContext): NodeJS.Timeout {
    return setTimeout(() => {
      Promise.resolve(this.run(ctx)).then(() => this.setTimeout(ctx));
    }, this.getInterval());
  }
}
