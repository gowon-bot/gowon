import { BaseService } from "./BaseService";
import { TrackedError } from "../database/entity/meta/Error";

export class TrackingService extends BaseService {
  error(error: Error) {
    TrackedError.logError(error);
  }
}
