import { Message, User } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Whoami extends LastFMBaseCommand {
  aliases = ["me"];
  description = "Displays your Last.fm username, or if you mention another user, theirs";
  subcategory = "accounts";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: standardMentions,
  };

  async run(message: Message) {
    let user = this.parsedArguments.user as User;

    let { username } = await this.parseMentions();

    let perspective = this.usersService.discordPerspective(
      message.author,
      user
    );

    this.reply(`${perspective.plusToBe} logged in as ${username.code()}.`);
  }
}
