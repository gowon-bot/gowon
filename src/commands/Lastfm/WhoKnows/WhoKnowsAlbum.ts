import { bold, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { Variation } from "../../../lib/command/Command";
import { VARIATIONS } from "../../../lib/command/variations";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../lib/ui/displays";
import { WhoKnowsBaseCommand } from "./LilacWhoKnowsBaseCommand";

const args = {
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export default class WhoKnowsAlbum extends WhoKnowsBaseCommand<typeof args> {
  idSeed = "redsquare green";

  subcategory = "whoknows";
  description = "Shows who has scrobbled an album in a server";
  aliases = ["wkl", "wka", "fmwka"];

  variations: Variation[] = [VARIATIONS.global("wkl", "wka")];

  slashCommand = true;

  arguments = args;

  async run() {
    const { senderRequestable, senderUser } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.album,
    });

    const senderLilacUser = await this.lilacUsersService.fetch(this.ctx, {
      discordID: this.author.id,
    });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(this.ctx, senderRequestable, {
        redirect: true,
      });

    const guildID = this.isGlobal() ? undefined : this.requiredGuild.id;

    const { whoKnowsAlbum: whoKnows, whoKnowsAlbumRank: whoKnowsRank } =
      await this.lilacWhoKnowsService.whoKnowsAlbum(
        this.ctx,
        artistName,
        albumName,
        this.author.id,
        guildID
      );

    await this.cacheUserInfo(whoKnows.rows.map((u) => u.user));

    const { rows, album } = whoKnows;
    const { rank, playcount } = whoKnowsRank;

    const description = new LineConsolidator().addLines(
      {
        shouldDisplay: !album || rows.length === 0,
        string: "No one knows this album",
      },
      {
        shouldDisplay: album && rows.length !== 0,
        string: displayNumberedList(
          rows
            .slice(0, 15)
            .map(
              (wk) =>
                `${this.whoKnowsService.displayUser(
                  this.ctx,
                  wk.user
                )} - **${displayNumber(wk.playcount, "**play")}`
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
          `- **${displayNumber(playcount, "**play")}`,
      }
    );

    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataTitle} Who knows ${italic(
          album.name
        )} by ${bold(album.artist.name)} ${
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
