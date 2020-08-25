import { Message } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Logout extends LastFMBaseCommand {
  description = "Logs you out of lastfm";
  subcategory = "accounts";
  usage = "";

  async run(message: Message) {
    await this.usersService.clearUsername(
      message.author.id,
      message.guild?.id!
    );

    this.send(`Logged out successfully.`);
  }
}
