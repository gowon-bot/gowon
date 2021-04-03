import { Client, Message, User as DiscordUser } from "discord.js";
import { User } from "../database/entity/User";
import { GowonService } from "../services/GowonService";
import specialUsers from "./specialUsers.json";

export class GowonClient {
  public hasPM2 = false;

  constructor(public client: Client, public environment: string) {}

  get specialUsers() {
    return specialUsers;
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

  isDeveloperOf(bot: "chuu" | "fmbot" | "rem", userID?: string) {
    return this.specialUsers.otherBotDevelopers[bot].some(
      (dev) => dev.id === userID
    );
  }

  isBot(
    userID: string | undefined,
    botName: "rem" | "gowon" | "gowon development"
  ) {
    return this.specialUsers.bots.some(
      (bot) => bot.name === botName && bot.id === userID
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

    return GowonService.getInstance().constants.unknownUserDisplay;
  }
}
