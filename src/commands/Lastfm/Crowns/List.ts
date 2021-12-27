import { CrownsChildCommand } from "./CrownsChildCommand";
import { getOrdinal } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { toInt } from "../../../helpers/lastFM";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";

const args = {
  mentions: standardMentions,
} as const;

export class List extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn eunseo";

  description = "Lists a user's top crowns";
  usage = ["", "@user"];

  arguments: Arguments = args;

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const discordID = dbUser.discordID;

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [crowns, crownsCount, rank] = await Promise.all([
      this.crownsService.listTopCrowns(this.ctx, discordID, -1),
      this.crownsService.count(this.ctx, discordID),
      this.crownsService.getRank(this.ctx, discordID),
    ]);

    if (!crownsCount) {
      throw new LogicError(
        `${perspective.name} don't have any crowns in this server!`
      );
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crowns"))
      .setTitle(`${perspective.upper.possessive} crowns in ${this.guild.name}`);

    const scrollingEmbed = new SimpleScrollingEmbed(this.message, embed, {
      pageSize: 15,
      items: crowns,
      pageRenderer(crownsPage, { offset }) {
        return displayNumberedList(
          crownsPage.map(
            (c) =>
              `${c.artistName} - ${displayNumber(c.plays, "play").strong()}`
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

    scrollingEmbed.send();
  }
}
