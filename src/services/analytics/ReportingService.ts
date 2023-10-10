import * as Sentry from "@sentry/node";
import config from "../../../config.json";
import { ClientError } from "../../errors/errors";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

export class ReportingService extends BaseService {
  async init() {
    Sentry.init({
      dsn: config.sentryDSN,
    });
  }

  public reportError(ctx: GowonContext, e: Error): void {
    Sentry.withScope((scope) => {
      this.addContextToScope(ctx, scope);

      if (e instanceof ClientError) {
        scope.setLevel("log");
      }

      Sentry.captureException(e);
    });
  }

  private addContextToScope(ctx: GowonContext, scope: Sentry.Scope) {
    scope.setTag("command-name", ctx.command?.friendlyNameWithParent);

    scope.setUser({
      id: ctx.author.id,
      username: ctx.author.username,
    });

    scope.setExtra("user", {
      discord: { id: ctx.author.id, username: ctx.author.username },
    });
    scope.setExtra("arguments", ctx.command.parsedArguments ?? {});
    scope.setExtra("guild-id", ctx.guild?.id ?? "DM");
  }
}
