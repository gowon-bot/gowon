import { GowonContext } from "../../lib/context/Context";
import {
  MirrorballPrivacy,
  MirrorballUser,
  MirrorballUserType,
  UserInput,
} from "../../services/mirrorball/MirrorballTypes";
import { BaseMockService } from "./BaseMockService";

export class MockMirrorballUsersService extends BaseMockService {
  async getMirrorballUser(
    _ctx: GowonContext,
    _inputs: UserInput[]
  ): Promise<MirrorballUser[] | undefined> {
    return undefined;
  }

  async updatePrivacy(_ctx: GowonContext, _privacy: MirrorballPrivacy) {}

  public async login(
    _ctx: GowonContext,
    _username: string,
    _userType: MirrorballUserType,
    _session: string | undefined
  ) {}

  public async logout(_ctx: GowonContext) {}

  public async quietAddUserToGuild(
    _ctx: GowonContext,
    _discordID: string,
    _guildID: string
  ): Promise<Error | undefined> {
    return;
  }

  public async quietRemoveUserFromGuild(
    _ctx: GowonContext,
    _discordID: string,
    _guildID: string
  ): Promise<Error | undefined> {
    return;
  }

  public async fullIndex(_ctx: GowonContext) {}

  public async getCachedPlaycount(
    _ctx: GowonContext,
    _discordID: string
  ): Promise<number> {
    return 0;
  }

  public async updateAndWait(
    _ctx: GowonContext,
    _discordID: string,
    _timeout = 2000
  ): Promise<void> {}
}
