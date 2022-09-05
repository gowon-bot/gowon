import { Guild } from "discord.js";
import { ShallowCache } from "../../database/cache/ShallowCache";
import { ExtractedCommand } from "../../lib/command/extractor/ExtractedCommand";
import { gowonServiceConstants } from "../../services/GowonService";
import { BaseMockService } from "./BaseMockService";

export class MockGowonService extends BaseMockService {
  shallowCache = new ShallowCache();

  constants = gowonServiceConstants;

  prefix(_guildID: string): string {
    return "!";
  }

  regexSafePrefix(_serverID: string): string {
    return "!";
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
