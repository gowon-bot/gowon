import { bold, sanitizeForDiscord } from "../../../helpers/discord";
import { CommandRedirect } from "../../../lib/command/Command";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayNumberedList } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { CrownHolder } from "../../../services/dbservices/crowns/CrownsService.types";
import { GuildAt } from "../../Archived/crowns/GuildAt";
import { GuildUserRank } from "../../Archived/crowns/GuildRank";
import { CrownsChildCommand } from "./CrownsChildCommand";
import { GuildAround } from "./GuildAround";

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
} satisfies ArgumentsMap;

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
      this.crownsService.guildLeaderboard(this.ctx, serverUsers),
      this.crownsService.countAllInServer(this.ctx, serverUsers),
    ]);

    const embed = this.minimalEmbed().setTitle(
      `${this.requiredGuild.name}'s crown leaderboard`
    );

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: holders,
      pageSize: 15,
      pageRenderer: this.renderPage(crownsCount),
    });

    await this.reply(scrollingEmbed);
  }

  private renderPage(crownsCount: number) {
    const func = (
      items: CrownHolder[],
      pageInfo: { page: number; offset: number }
    ) => {
      return (
        `There ${crownsCount === 1 ? "is" : "are"} **${displayNumber(
          crownsCount,
          "** crown"
        )} in ${this.requiredGuild.name}\n\n` +
        displayNumberedList(
          items.map(
            (ch) =>
              `${sanitizeForDiscord(ch.user.username)} with ${bold(
                displayNumber(ch.numberOfCrowns, "crown")
              )}`
          ),
          pageInfo.offset
        )
      );
    };

    return func.bind(this);
  }
}
