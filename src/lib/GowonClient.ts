import { Client, Message, User as DiscordUser } from "discord.js";
import { User } from "../database/entity/User";
import { flatDeep } from "../helpers";
import { GowonService } from "../services/GowonService";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { isUnicodeEmoji } from "./arguments/custom/EmojiParser";
import { SettingsService } from "./settings/SettingsService";
import specialUsers from "./specialUsers.json";

export type BotName =
  | "rem"
  | "gowon"
  | "gowon development"
  | "chuu"
  | "fmbot"
  | "fmbot develop";

export class GowonClient {
  public hasPM2 = false;

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

  isDeveloper(userID?: string): boolean {
    return this.specialUsers.developers.some((dev) => dev.id === userID);
  }

  isAlphaTester(userID?: string) {
    return (
      this.isDeveloper(userID) ||
      this.specialUsers.alphaTesters.some((tester) => tester.id === userID)
    );
  }

  isGowon(userID?: string) {
    return (
      this.isBot(userID, "gowon") || this.isBot(userID, "gowon development")
    );
  }

  isDeveloperOf(
    bot: Exclude<BotName, "gowon" | "gowon development" | "fmbot develop">,
    userID?: string
  ) {
    return this.specialUsers.otherBotDevelopers[bot].some(
      (dev) => dev.id === userID
    );
  }

  isBot(userID: string | undefined, botName: BotName | BotName[]) {
    const botNames = flatDeep([botName]);

    return this.specialUsers.bots.some(
      (bot) => botNames.includes(bot.name) && bot.id === userID
    );
  }

  async userDisplay(message: Message, user?: string): Promise<string>;
  async userDisplay(message: Message, user?: DiscordUser): Promise<string>;
  async userDisplay(
    message: Message,
    user?: DiscordUser | string
  ): Promise<string> {
    if (
      user &&
      (await User.stillInServer(
        message,
        typeof user === "string" ? user : user.id
      ))
    ) {
      if (typeof user === "string") {
        try {
          let fetchedUser = (await message.guild!.members.fetch(user))?.user;
          return fetchedUser.username;
        } catch {}
      } else {
        return user.username;
      }
    }

    return ServiceRegistry.get(GowonService).constants.unknownUserDisplay;
  }

  displayEmoji(resolvable: string): string {
    return isUnicodeEmoji(resolvable)
      ? resolvable
      : this.client.emojis.resolve(resolvable)?.toString()!;
  }
}
