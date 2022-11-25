import chalk from "chalk";
import { CustomContext, GowonContext, UnwrapContext } from "../lib/context/Context";

export class BaseService<ContextT extends GowonContext = GowonContext<{}>> {
  customContext?: UnwrapContext<ContextT>;

  ctx(ctx: GowonContext<CustomContext>): ContextT {
    if (this.customContext) {
      ctx.addContext(this.customContext);
    }

    return ctx as ContextT;
  }

  protected log(ctx: ContextT, msg: string): void {
    ctx.logger.log(this.constructor.name, chalk`{grey ${msg}}`);
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
