import { BaseService } from "../../services/BaseService";
import { Command } from "../command/Command";
import { GowonContext } from "../context/Context";

export class PermissionsService extends BaseService {
  async canRunInContext(ctx: GowonContext, command: Command): Promise<boolean> {
    return false;
  }
}
