import { Message } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Logout extends LastFMBaseCommand {
  description = "Unsets your Last.fm username in Gowon";
  subcategory = "accounts";
  usage = "";

  async run(message: Message) {
    await this.usersService.clearUsername(message.author.id);

    this.send(`Logged out successfully.`);
  }
}
