import { Client } from "discord.js";
import specialUsers from "./specialUsers.json";

export class GowonClient {
  constructor(public client: Client) {}

  private getUserIDs(users: { [key: string]: string | undefined }[]): string[] {
    return users.map((a) => Object.keys(a)[0]);
  }

  isAuthor(userID?: string) {
    return this.getUserIDs(specialUsers.authors).includes(userID || "");
  }

  isAlphaTester(userID?: string) {
    return (
      this.isAuthor(userID) ||
      this.getUserIDs(specialUsers.alphaTesters).includes(userID || "")
    );
  }

  isGowon(userID?: string) {
    return this.getUserIDs(specialUsers.bots).includes(userID || "");
  }
}
