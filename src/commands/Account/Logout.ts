import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";

export default class Logout extends BaseCommand {
  description = "Logs you out of lastfm";

  async run(message: Message) {
    await this.usersService.clearUsername(message.author.id);

    message.channel.send(`Logged out successfully.`);
  }
}
