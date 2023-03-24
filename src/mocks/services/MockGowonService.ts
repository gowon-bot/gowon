import { Guild } from "discord.js";
import { GowonCache } from "../../database/cache/GowonCache";
import { ExtractedCommand } from "../../lib/command/extractor/ExtractedCommand";
import { gowonServiceConstants } from "../../services/GowonService";
import { BaseMockService } from "./BaseMockService";

export class MockGowonService extends BaseMockService {
  public cache = new GowonCache();

  constants = gowonServiceConstants;

  prefix(_guildID: string): string {
    return "!";
  }

  regexSafePrefix(_serverID: string): string {
    return "!";
  }

  prefixAtStartOfMessageRegex(_guildID: string): RegExp {
    return new RegExp(`![^\\s]+`, "i");
  }

  removeCommandName(
    string: string,
    extract: ExtractedCommand,
    serverID: string
  ): string {
    return string
      .replace(
        new RegExp(
          `${this.regexSafePrefix(serverID)}${extract.asRemovalRegexString()}`,
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
