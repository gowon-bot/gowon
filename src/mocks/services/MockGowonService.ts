import { Guild } from "discord.js";
import { ShallowCache } from "../../database/cache/ShallowCache";
import { RunAs } from "../../lib/command/RunAs";
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

  removeCommandName(string: string, runAs: RunAs, serverID: string): string {
    return string
      .replace(
        new RegExp(
          `${this.regexSafePrefix(serverID)}${runAs.toRegexString()}`,
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
