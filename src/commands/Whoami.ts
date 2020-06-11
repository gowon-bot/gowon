import { BaseCommand } from "../BaseCommand";
import { Message } from "discord.js";
import { sanitizeForDiscord } from "../helpers/discord";

export class Whoami extends BaseCommand {
  aliases = ["me"];
  description = "Displays your login";

  async run(message: Message) {
    let username = await this.usersService.getUsername(message.author.id);

    message.reply(`you are logged in as \`${sanitizeForDiscord(username)}\`.`);
  }
}
