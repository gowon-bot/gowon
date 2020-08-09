import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";

export default class LastFmToDiscord extends LastFMBaseCommand {
  aliases = ["lfm2d"];
  description = "Displays who is logged in as a given user";
  subcategory = "accounts"
  usage = "lastfm_username"

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
  };

  async run(message: Message) {
    let username = this.parsedArguments.username as string;

    if (!username) throw new LogicError("please enter a username to lookup");

    let user = await this.usersService.getUserFromLastFMUsername(
      username,
      message.guild?.id!
    );

    let member = await message.guild!.members.fetch(user?.discordID || "");

    if (!user || !member)
      throw new LogicError(
        `couldn't find anyone logged in as ${username.code()} in this server.`
      );

    message.reply(`${member.displayName.bold()} is logged in as ${username.code()}.`);
  }
}
