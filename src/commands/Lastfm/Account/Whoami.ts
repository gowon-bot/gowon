import { Message, User } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Whoami extends LastFMBaseCommand {
  aliases = ["me"];
  description = "Displays your login";
  subcategory = "accounts";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: {
      user: { index: 0, description: "The user to lookup" },
    },
  };

  async run(message: Message) {
    let user = this.parsedArguments.user as User;

    let { username } = await this.parseMentionedUsername();

    let perspective = this.usersService.discordPerspective(
      message.author,
      user
    );

    this.reply(`${perspective.plusToBe} logged in as ${username.code()}.`);
  }
}
