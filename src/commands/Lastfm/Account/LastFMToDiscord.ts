import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export default class LastFmToDiscord extends LastFMBaseCommand {
  aliases = ["lfm2d", "last2todiscord", "l2d"];
  description = "Displays who is logged in as a given user";
  subcategory = "accounts";
  usage = "lastfm_username";

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
  };

  validation: Validation = {
    username: new validators.Required({}),
  };

  async run() {
    let username = this.parsedArguments.username as string;

    let user = await this.usersService.getUserFromLastFMUsername(username);

    let member = user
      ? await this.guild.members.fetch(user.discordID)
      : undefined;

    if (!user || !member)
      throw new LogicError(
        `couldn't find anyone logged in as ${username.code()} in this server.`
      );

    this.reply(
      `${(member.nickname || member.user.username).bold()} (${
        member.user.username
      }#${
        member.user.discriminator
      }) is logged in as ${username.toLowerCase().code()}.`
    );
  }
}
