import { GowonContext } from "../../lib/context/Context";
import { LilacUserInput } from "../../services/lilac/LilacAPIService.types";
import { BaseMockService } from "./BaseMockService";

export class MockLilacUsersService extends BaseMockService {
  public async update(
    _ctx: GowonContext,
    _user: LilacUserInput
  ): Promise<void> {}
}
