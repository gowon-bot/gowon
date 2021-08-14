import { BaseService } from "./BaseService";
import { TrackedError } from "../database/entity/meta/Error";

export class TrackingService extends BaseService {
  error(error: Error) {
    this.log(`Logging error ${error.name}`);

    if (error.name) TrackedError.logError(error);
  }
}
