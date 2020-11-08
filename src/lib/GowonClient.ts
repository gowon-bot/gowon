import { Client, Message, User as DiscordUser } from "discord.js";
import { User } from "../database/entity/User";
import { GowonService } from "../services/GowonService";
import specialUsers from "./specialUsers.json";

export class GowonClient {
  constructor(public client: Client) {}

  private getUserIDs(users: { [key: string]: string | undefined }[]): string[] {
    return users.map((a) => Object.keys(a)[0]);
  }

  isDeveloper(userID?: string) {
    return this.getUserIDs(specialUsers.developers).includes(userID || "");
  }

  isAlphaTester(userID?: string) {
    return (
      this.isDeveloper(userID) ||
      this.getUserIDs(specialUsers.alphaTesters).includes(userID || "")
    );
  }

  isGowon(userID?: string) {
    return this.getUserIDs(specialUsers.bots).includes(userID || "");
  }

  async userDisplay(message: Message, user?: string): Promise<string>;
  async userDisplay(message: Message, user?: DiscordUser): Promise<string>;
  async userDisplay(
    message: Message,
    user?: DiscordUser | string
  ): Promise<string> {
    if (
      user &&
      await User.stillInServer(
        message,
        typeof user === "string" ? user : user.id
      )
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
