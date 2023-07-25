import { Guild } from "discord.js";
import { userMentionAtStartRegex } from "../../helpers/discord";
import { GowonContext } from "../../lib/context/Context";
import { BaseMockService } from "./BaseMockService";

export const mockPrefix = "!";

export class MockGowonService extends BaseMockService {
  prefix(_guildID: string): string {
    return mockPrefix;
  }

  regexSafePrefix(_serverID: string): string {
    return mockPrefix;
  }

  prefixAtStartOfMessageRegex(_guildID: string): RegExp {
    return new RegExp(`${mockPrefix}[^\\s]+`, "i");
  }

  public removeCommandName(ctx: GowonContext, string: string): string {
    return string
      .replace(
        new RegExp(`${mockPrefix}${ctx.extract.asRemovalRegexString()}`, "i"),
        ""
      )
      .replace(
        new RegExp(
          `${
            userMentionAtStartRegex(ctx.botUser.id).source
          }\\s+${ctx.extract.asRemovalRegexString()}`,
          "i"
        ),
        ""
      )
      .trim();
  }

  async getInactiveRole(_guild: Guild): Promise<string | undefined> {
    return undefined;
  }

  async getPurgatoryRole(_guild: Guild): Promise<string | undefined> {
    return undefined;
  }

  async getCrownBannedUsers(_guild: Guild): Promise<string[]> {
    return [];
  }

  async isUserCrownBanned(_guild: Guild, _discordID: string): Promise<boolean> {
    return false;
  }

  async getCrownBannedArtists(_guild: Guild): Promise<string[]> {
    return [];
  }

  async isArtistCrownBanned(
    _guild: Guild,
    _artistName: string
  ): Promise<boolean> {
    return false;
  }
}
