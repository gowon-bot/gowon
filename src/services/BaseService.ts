import { Logger } from "../lib/Logger";
import chalk from "chalk";
import { SimpleMap } from "../helpers/types";
import { Guild } from "discord.js";
import { BaseCommand } from "../lib/command/BaseCommand";
import { GowonClient } from "../lib/GowonClient";

export type BaseServiceContext = {
  logger?: Logger;
  command: BaseCommand;
  client: GowonClient;
};

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

  protected guild(ctx: SimpleMap): Guild {
    return ctx.command.guild;
  }

  protected author(ctx: SimpleMap): Guild {
    return ctx.command.author;
  }
}
