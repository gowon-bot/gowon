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
} from "../../../lib/views/displays";
import { WhoKnowsBaseCommand } from "./LilacWhoKnowsBaseCommand";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export default class WhoKnowsTrack extends WhoKnowsBaseCommand<typeof args> {
  idSeed = "redsquare lina";

  aliases = ["wkt"];
  subcategory = "whoknows";

  variations: Variation[] = [VARIATIONS.global("wkt")];

  description = "Shows who has scrobbled a track in a server";

  slashCommand = true;

  arguments = args;

  async run() {
    const { senderRequestable, senderUser } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.track,
    });

    const senderLilacUser = await this.lilacUsersService.fetchUser(this.ctx, {
      discordID: this.author.id,
    });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable);

    const guildID = this.isGlobal() ? undefined : this.requiredGuild.id;

    const { whoKnowsTrack: whoKnows, whoKnowsTrackRank: whoKnowsRank } =
      await this.lilacWhoKnowsService.whoKnowsTrack(
        this.ctx,
        artistName,
        trackName,
        this.author.id,
        guildID
      );

    await this.cacheUserInfo(whoKnows.rows.map((u) => u.user));

    const { rows, track } = whoKnows;
    const { rank, playcount } = whoKnowsRank;

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        shouldDisplay: !track || rows.length === 0,
        string: "No one knows this track",
      },
      {
        shouldDisplay: track && rows.length !== 0,
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

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Who knows track"))
      .setTitle(
        `${Emoji.usesIndexedDataTitle} Who knows ${italic(
          track.name
        )} by ${bold(track.artist.name)} ${
          this.isGlobal() ? "globally" : `in ${this.requiredGuild.name}`
        }?`
      )
      .setDescription(lineConsolidator.consolidate())
      .setFooter({
        text: (
          `${displayNumber(
            rows.length,
            this.isGlobal() ? "global listener" : "server listener"
          )}\n` + this.footerHelp(senderLilacUser)
        ).trim(),
        iconURL: this.isGlobal()
          ? this.gowonIconURL
          : this.guild?.iconURL() ?? undefined,
      });

    await this.send(embed);
  }
}
