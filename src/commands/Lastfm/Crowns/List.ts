import { UserHasNoCrownsInServerError } from "../../../errors/commands/crowns";
import { getOrdinal } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { toInt } from "../../../helpers/lastfm/";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayNumberedList } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class List extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn eunseo";

  description = "Lists a user's top crowns";
  usage = ["", "@user"];

  arguments = args;

  slashCommand = true;

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      dbUserRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [crowns, rank] = await Promise.all([
      this.crownsService.listTopCrowns(this.ctx, dbUser.id, -1),
      this.crownsService.getRank(this.ctx, dbUser.id),
    ]);

    if (!crowns.length) {
      throw new UserHasNoCrownsInServerError(perspective);
    }

    const embed = this.minimalEmbed().setTitle(
      `${perspective.upper.possessive} crowns in ${this.requiredGuild.name}`
    );

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      pageSize: 15,
      items: crowns,
      pageRenderer(crownsPage, { offset }) {
        return displayNumberedList(
          crownsPage.map(
            (c) => `${c.artistName} - ${bold(displayNumber(c.plays, "play"))}`
          ),
          offset
        );
      },
      overrides: {
        itemName: "crown",
        customFooter: (page: number, totalPages: number) =>
          `Page ${page} of ${totalPages} • ${displayNumber(
            crowns.length,
            "crown"
          )} • ranked ${getOrdinal(toInt(rank.rank))}`,
      },
    });

    await this.reply(scrollingEmbed);
  }
}
