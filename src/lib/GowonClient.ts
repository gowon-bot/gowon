import { Client } from "discord.js";
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
}
