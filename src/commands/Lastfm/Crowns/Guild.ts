import { CrownsChildCommand } from "./CrownsChildCommand";
import { CommandRedirect } from "../../../lib/command/Command";
import { GuildAround } from "./GuildAround";
import { GuildAt } from "./GuildAt";
import { displayNumber } from "../../../lib/views/displays";
import { asyncMap } from "../../../helpers";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { GuildUserRank } from "./GuildRank";
import { bold } from "../../../helpers/discord";

const args = {
  meInput: new StringArgument({ match: ["me"], slashCommandOption: false }),
  me: new Flag({
    shortnames: ["m"],
    longnames: ["me"],
    description: "Check your position on the leaderboard",
  }),
  rank: new NumberArgument({
    description: "The rank to check on the leaderboard",
  }),
  ...standardMentions,
} as const;

export class Guild extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki rina";

  description = "Shows the server's crowns leaderboard";
  aliases = ["leaderboard", "ldb", "lb"];
  usage = "";

  slashCommand = true;
  slashCommandName = "leaderboard";

  arguments = args;

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => !!args.me,
      redirectTo: GuildAround,
    },
    {
      when: (args) => !!args.rank && !isNaN(args.rank),
      redirectTo: GuildAt,
    },
    {
      when: (args) =>
        !!args.discordUsername ||
        !!args.lastfmUsername ||
        !!args.user ||
        !!args.userID,
      redirectTo: GuildUserRank,
    },
  ];

  async run() {
    const serverUsers = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    const [holders, crownsCount] = await Promise.all([
      this.crownsService.guildLeaderboard(this.ctx, 20, serverUsers),
      this.crownsService.countAllInServer(this.ctx, serverUsers),
    ]);

    const embed = this.newEmbed()
      .setTitle(`${this.requiredGuild.name}'s crown leaderboard`)
      .setDescription(
        `There ${crownsCount === 1 ? "is" : "are"} **${displayNumber(
          crownsCount,
          "** crown"
        )} in ${this.requiredGuild.name}\n\n` +
          (
            await asyncMap(
              holders,
              async (h, idx) =>
                `${idx + 1}. ${await this.gowonClient.userDisplay(
                  this.ctx,
                  h.user
                )} with ${bold(displayNumber(h.numberOfCrowns, "crown"))}`
            )
          ).join("\n")
      );

    await this.send(embed);
  }
}
