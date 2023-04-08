import { Client, User as DiscordUser, Guild } from "discord.js";
import { User } from "../database/entity/User";
import { BotName } from "../helpers/bots";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { constants } from "./constants";
import { GowonContext } from "./context/Context";
import { isUnicodeEmoji } from "./context/arguments/parsers/EmojiParser";
import { SettingsService } from "./settings/SettingsService";
import specialUsers from "./specialUsers.json";

export class GowonClient {
  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  constructor(public client: Client, public environment: string) {}

  get specialUsers() {
    return specialUsers;
  }

  get isInIssueMode(): boolean {
    return this.settingsService.get("issueMode", {}) === "true";
  }

  get isTesting(): boolean {
    return this.environment === "test";
  }

  isDeveloper(userID?: string): boolean {
    if (!userID) return false;

    return this.specialUsers.developers.some((dev) => dev.id === userID);
  }

  isAlphaTester(userID?: string) {
    return (
      this.isDeveloper(userID) ||
      this.specialUsers.alphaTesters.some((tester) => tester.id === userID)
    );
  }

  isDeveloperOf(
    bot: Exclude<
      BotName,
      "gowon" | "gowon development" | "fmbot develop" | "who knows" | "miso"
    >,
    userID?: string
  ) {
    return this.specialUsers.otherBotDevelopers[bot].some(
      (dev) => dev.id === userID
    );
  }

  async userDisplay(ctx: GowonContext, user?: string): Promise<string>;
  async userDisplay(ctx: GowonContext, user?: DiscordUser): Promise<string>;
  async userDisplay(
    ctx: GowonContext,
    user?: DiscordUser | string
  ): Promise<string> {
    if (
      user &&
      (await User.stillInServer(ctx, typeof user === "string" ? user : user.id))
    ) {
      if (typeof user === "string") {
        try {
          let fetchedUser = (await ctx.guild!.members.fetch(user))?.user;
          return fetchedUser.username;
        } catch {}
      } else {
        return user.username;
      }
    }

    return constants.unknownUserDisplay;
  }

  displayEmoji(resolvable: string): string {
    return isUnicodeEmoji(resolvable)
      ? resolvable
      : this.client.emojis.resolve(resolvable)?.toString()!;
  }

  async canUserAdminGuild(guild: Guild, userID: string): Promise<boolean> {
    try {
      const guildMember = await guild.members.fetch(userID);

      if (guildMember.permissions.has("ADMINISTRATOR")) return true;

      const adminRole = this.settingsService.get("adminRole", {
        guildID: guild.id,
      });

      return (adminRole && guildMember.roles.cache.has(adminRole)) || false;
    } catch {
      return false;
    }
  }
}
