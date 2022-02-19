import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";

const args = {
  username: new StringArgument({ index: 0 }),
} as const;

export default class LastFmToDiscord extends LastFMBaseCommand<typeof args> {
  idSeed = "loona choerry";

  aliases = ["lfm2d", "last2todiscord", "l2d"];
  description = "Displays who is logged in as a given Last.fm user";
  subcategory = "accounts";
  usage = "lastfm_username";

  arguments = args;

  validation: Validation = {
    username: new validators.Required({}),
  };

  async run() {
    let username = this.parsedArguments.username!;

    let user = await this.usersService.getUserFromLastFMUsername(
      this.ctx,
      username
    );

    let member = user
      ? await this.guild.members.fetch(user.discordID)
      : undefined;

    if (!user || !member)
      throw new LogicError(
        `couldn't find anyone logged in as ${username.code()} in this server.`
      );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Account lookup"))
      .setDescription(
        `${(member.nickname || member.user.username).strong()} (${
          member.user.username
        }#${member.user.discriminator}) is logged in as ${username
          .toLowerCase()
          .code()}.`
      );

    await this.send(embed);
  }
}
