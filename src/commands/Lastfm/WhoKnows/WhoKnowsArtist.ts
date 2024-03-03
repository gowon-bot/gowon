import { bold } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { Variation } from "../../../lib/command/Command";
import { VARIATIONS } from "../../../lib/command/variations";
import {
  prefabArguments,
  prefabFlags,
} from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../lib/ui/displays";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WhoKnowsBaseCommand } from "./LilacWhoKnowsBaseCommand";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} satisfies ArgumentsMap;

export default class WhoKnowsArtist extends WhoKnowsBaseCommand<typeof args> {
  idSeed = "bvndit songhee";
  description = "Shows who has scrobbled an artist in a server";
  subcategory = "whoknows";
  aliases = ["wk", "fmwk", "whoknows"];

  variations: Variation[] = [VARIATIONS.global("wk")];

  slashCommand = true;

  arguments = args;

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    const { senderRequestable, senderUser } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
    });

    const senderLilacUser = await this.lilacUsersService.fetch(this.ctx, {
      discordID: this.author.id,
    });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const crown = this.isGlobal()
      ? undefined
      : await this.crownsService.getCrown(this.ctx, artistName);

    const guildID = this.isGlobal() ? undefined : this.requiredGuild.id;

    const { whoKnowsArtist: whoKnows, whoKnowsArtistRank: whoKnowsRank } =
      await this.lilacWhoKnowsService.whoKnowsArtist(
        this.ctx,
        artistName,
        this.author.id,
        guildID
      );

    await this.cacheUserInfo(whoKnows.rows.map((u) => u.user));

    const { rows, artist } = whoKnows;
    const { rank, playcount } = whoKnowsRank;

    console.log(rows);

    const description = new LineConsolidator().addLines(
      {
        shouldDisplay: !artist || rows.length === 0,
        string: "No one knows this artist",
      },
      {
        shouldDisplay: artist && rows.length !== 0,
        string: displayNumberedList(
          rows
            .slice(0, 15)
            .map(
              (wk) =>
                `${this.whoKnowsService.displayUser(
                  this.ctx,
                  wk.user
                )} - **${displayNumber(wk.playcount, "**play")}${
                  crown?.user?.discordID === wk.user.discordID ? " 👑" : ""
                }`
            )
        ),
      },
      {
        shouldDisplay: rank > 15 && !!senderUser,
        string:
          `\n\`${rank}.\` ` +
          bold(
            displayLink(
              this.payload.member?.nickname || this.payload.author.username,
              LastfmLinks.userPage(senderUser?.lastFMUsername!)
            )
          ) +
          `- **${displayNumber(playcount, "**play")}` +
          (crown?.user?.discordID === this.author.id ? " 👑" : ""),
      }
    );

    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataTitle} Who knows ${bold(artist.name)} ${
          this.isGlobal() ? "globally" : `in ${this.requiredGuild.name}`
        }?`
      )
      .setDescription(description)
      .setFooter(
        (
          `${displayNumber(
            whoKnowsRank.totalListeners,
            this.isGlobal() ? "global listener" : "server listener"
          )}\n` + this.footerHelp(senderLilacUser)
        ).trim()
      )
      .setFooterIcon(
        this.isGlobal() ? this.gowonIconURL : this.guild?.iconURL() ?? undefined
      );

    await this.reply(embed);
  }
}
