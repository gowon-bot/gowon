import { BaseService, BaseServiceContext } from "./BaseService";
import { TrackedError } from "../database/entity/meta/Error";

export class TrackingService extends BaseService {
  error(ctx: BaseServiceContext, error: Error) {
    this.log(ctx, `Logging error ${error.name}`);

    if (error.name) TrackedError.logError(error);
  }
}
