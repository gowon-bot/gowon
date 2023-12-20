import { LogicError } from "../../../errors/errors";
import { bold, code } from "../../../helpers/discord";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayUserTag } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  username: new StringArgument({
    index: 0,
    description: "The username of the user to lookup",
    required: true,
  }),
} satisfies ArgumentsMap;

export default class LastFmToDiscord extends LastFMBaseCommand<typeof args> {
  idSeed = "loona choerry";

  aliases = ["lfm2d", "last2todiscord", "l2d"];
  description = "Shows who is logged in as a given Last.fm user";
  subcategory = "accounts";
  usage = "lastfm_username";

  arguments = args;
  slashCommand = true;
  guildRequired = true;

  async run() {
    const username = this.parsedArguments.username;

    const user = await this.usersService.getUserFromLastFMUsername(
      this.ctx,
      username
    );

    const member = user
      ? await this.requiredGuild.members.fetch(user.discordID)
      : undefined;

    if (!user || !member) {
      throw new LogicError(
        `couldn't find anyone logged in as ${code(username)} in this server.`
      );
    }

    const embed = this.authorEmbed()
      .setHeader("Account lookup")
      .setDescription(
        `${bold(member.nickname || member.user.username)} (${displayUserTag(
          member.user
        )}) is logged in as ${code(username.toLowerCase())}.`
      );

    await this.send(embed);
  }
}
