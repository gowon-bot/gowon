import { BaseService } from "./BaseService";
import { TrackedError } from "../database/entity/meta/Error";
import { GowonContext } from "../lib/context/Context";

export class TrackingService extends BaseService {
  error(ctx: GowonContext, error: Error) {
    this.log(ctx, `Logging error ${error.name}`);

    if (error.name) TrackedError.logError(error);
  }
}
