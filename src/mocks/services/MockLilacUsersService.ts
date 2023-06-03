import { GowonContext } from "../../lib/context/Context";
import {
  LilacUserInput,
  LilacUserModifications,
} from "../../services/lilac/LilacAPIService.types";
import { BaseMockService } from "./BaseMockService";

export class MockLilacUsersService extends BaseMockService {
  public async update(
    _ctx: GowonContext,
    _user: LilacUserInput
  ): Promise<void> {}

  public async login(_ctx: GowonContext, _username: string, _session: string) {}

  public async logout(_ctx: GowonContext) {}

  public async modifyUser(
    _ctx: GowonContext,
    _user: LilacUserInput,
    _modifications: LilacUserModifications
  ) {}
}
