import { CanCheck } from "../../lib/permissions/PermissionsService";
import { BaseMockService } from "./BaseMockService";

export class MockPermissionsService extends BaseMockService {
  async canRunInContext(_ctx: any, _command: any): Promise<CanCheck> {
    return { allowed: true };
  }
}
