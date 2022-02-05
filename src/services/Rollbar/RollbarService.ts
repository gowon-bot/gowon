import Rollbar from "rollbar";
import { BaseService } from "../BaseService";
import config from "../../../config.json";
import { SimpleMap } from "../../helpers/types";
import { GowonContext } from "../../lib/context/Context";

export class RollbarService extends BaseService {
  private rollbar = new Rollbar({
    accessToken: config.rollbarToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  public logError(ctx: GowonContext, error: any) {
    if (config.environment === "production") {
      this.rollbar.error(error, {
        ...this.generatePayloadFromContext(ctx),
        level: error.isClientFacing ? "error" : "critical",
      });
    }
  }

  private generatePayloadFromContext(ctx: GowonContext): SimpleMap {
    return {
      environment: config.environment,
      person: {
        id: ctx?.author?.id,
        username: (ctx?.command?.parsedArguments as any)?.username,
      },
      context: ctx?.command?.friendlyNameWithParent,
      custom: {
        command: {
          id: ctx?.command?.id,
          name: ctx?.command?.name,
          parentName: ctx?.command?.parentName,
        },
      },
    };
  }
}
