import { Chance } from "chance";
import { User as DiscordUser } from "discord.js";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { User } from "../../database/entity/User";
import { RecordNotFoundError } from "../../errors/errors";
import { Perspective } from "../../lib/Perspective";
import { CommandAccessRoleName } from "../../lib/command/access/roles";
import { GowonContext } from "../../lib/context/Context";
import { Requestable } from "../../services/LastFM/LastFMAPIService";
import { LastFMSession } from "../../services/LastFM/converters/Misc";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { UsersService } from "../../services/dbservices/UsersService";
import { mockEntities } from "../gowon";
import { BaseMockService } from "./BaseMockService";

export class MockUsersService extends BaseMockService {
  get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

  async getUsername(ctx: GowonContext, discordID: string): Promise<string> {
    return (await this.getUser(ctx, discordID))?.lastFMUsername;
  }

  async getUser(_ctx: GowonContext, discordID: string): Promise<User> {
    return mockEntities.user({
      discordID: discordID,
      lastFMUsername: "flushed_emoji",
    });
  }

  async getRequestable(
    ctx: GowonContext,
    discordID: string
  ): Promise<Requestable> {
    return await this.getUsername(ctx, discordID);
  }

  async setUsername(
    _ctx: GowonContext,
    _discordID: string,
    lastFMUsername: string
  ): Promise<string> {
    return lastFMUsername;
  }

  async setLastFMSession(
    _ctx: GowonContext,
    _discordID: string,
    _lastFMSession: LastFMSession
  ): Promise<User> {
    return mockEntities.user();
  }

  async clearUsername(_ctx: GowonContext, _discordID: string): Promise<void> {}

  perspective(
    authorUsername: string,
    username?: string,
    asCode = true
  ): Perspective {
    return Perspective.perspective(authorUsername, username, asCode);
  }

  discordPerspective(
    author: DiscordUser,
    mentioned?: DiscordUser
  ): Perspective {
    return Perspective.discordPerspective(author, mentioned);
  }

  async countUsers(_ctx: GowonContext): Promise<number> {
    return Chance().integer();
  }

  async getUserFromLastFMUsername(
    _ctx: GowonContext,
    username: string
  ): Promise<User | undefined> {
    return mockEntities.user({ lastFMUsername: username });
  }

  async randomUser(ctx: GowonContext): Promise<User>;
  async randomUser(
    ctx: GowonContext,
    options?: { limit?: 1; userIDs?: string[] }
  ): Promise<User>;
  async randomUser(
    ctx: GowonContext,
    options?: {
      limit?: number;
      userIDs?: string[];
    }
  ): Promise<User[]>;
  async randomUser(
    _ctx: GowonContext,
    options: {
      limit?: number;
      userIDs?: string[];
    } = {}
  ): Promise<User | User[]> {
    if ((options.limit || 1) === 1) {
      return mockEntities.user();
    } else {
      return [mockEntities.user()];
    }
  }

  async setAsIndexed(_ctx: GowonContext, _discordID: string) {}

  async setPatron(_ctx: GowonContext, _discordID: string, _value: boolean) {}

  async setRoles(
    _ctx: GowonContext,
    _discordID: string,
    roles: CommandAccessRoleName[]
  ): Promise<User> {
    return mockEntities.user({ roles: roles });
  }

  async setSpotifyRefreshToken(
    _ctx: GowonContext,
    _discordID: string,
    _refreshToken: string
  ) {}

  async getSpotifyRefreshToken(
    _ctx: GowonContext,
    _discordID: string
  ): Promise<string | undefined> {
    return undefined;
  }
}

export function mockUsersServiceWithUsers(users: User[]) {
  return class MockUsersServiceWithUsers extends MockUsersService {
    mocks = UsersService.name;

    async getUser(_ctx: GowonContext, discordID: string): Promise<User> {
      const user = users.find((u) => u.discordID === discordID);

      if (!user) throw new RecordNotFoundError("user");

      return user;
    }

    async getUserFromLastFMUsername(
      _ctx: GowonContext,
      username: string
    ): Promise<User | undefined> {
      const user = users.find((u) => u.lastFMUsername === username);

      return user;
    }
  };
}
