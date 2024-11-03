import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

export class ReportingService extends BaseService {
  async init() {}

  public reportError(_ctx: GowonContext, _e: Error): void {}
}
