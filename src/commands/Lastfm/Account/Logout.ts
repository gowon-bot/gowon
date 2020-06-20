import { Message } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Logout extends LastFMBaseCommand {
  description = "Logs you out of lastfm";

  async run(message: Message) {
    await this.usersService.clearUsername(message.author.id);

    message.channel.send(`Logged out successfully.`);
  }
}
