import { Logger } from "../lib/Logger";
import chalk from "chalk";
import { SimpleMap } from "../helpers/types";

export type BaseServiceContext = { logger?: Logger };

export class BaseService<
  Context extends BaseServiceContext = BaseServiceContext,
  MutableContext extends SimpleMap = {}
> {
  customContext: SimpleMap = {};

  ctx(ctx: any): any & MutableContext {
    return Object.assign(ctx, this.customContext);
  }

  protected log(ctx: Context, msg: string): void {
    Logger.log(this.constructor.name, chalk`{grey ${msg}}`, ctx.logger);
  }

  protected basicAuthorization(left: string, right: string) {
    return `Basic ${Buffer.from(`${left}:${right}`, "binary").toString(
      "base64"
    )}`;
  }

  protected bearerAuthorization(token: string) {
    return `Bearer ${token}`;
  }
}
