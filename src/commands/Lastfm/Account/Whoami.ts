import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  mentions: standardMentions,
};

export default class Whoami extends LastFMBaseCommand<typeof args> {
  idSeed = "loona yves";

  aliases = ["me", "whoareyou"];
  description =
    "Displays your Last.fm username, or if you mention another user, theirs";
  subcategory = "accounts";
  usage = ["", "@user"];

  arguments: Arguments = args;

  async run(message: Message) {
    let { username, discordUser: user } = await this.parseMentions();

    let perspective = this.usersService.discordPerspective(
      message.author,
      user
    );

    this.reply(`${perspective.plusToBe} logged in as ${username.code()}.`);
  }
}
