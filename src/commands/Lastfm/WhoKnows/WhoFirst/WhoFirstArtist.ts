import { bold } from "../../../../helpers/discord";
import { LastfmLinks } from "../../../../helpers/lastfm/LastfmLinks";
import { convertLilacDate } from "../../../../helpers/lilac";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import { Variation } from "../../../../lib/command/Command";
import { VARIATIONS } from "../../../../lib/command/variations";
import {
  prefabArguments,
  prefabFlags,
} from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/emoji/Emoji";
import {
  displayDate,
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../../lib/ui/displays";
import { WhoKnowsBaseCommand } from "../LilacWhoKnowsBaseCommand";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} satisfies ArgumentsMap;

export default class WhoFirstArtist extends WhoKnowsBaseCommand<typeof args> {
  idSeed = "shasha garam";
  aliases = ["wf", "whofirst", "wfa"];

  subcategory = "whofirst";
  description = "See who first scrobbled an artist";

  variations: Variation[] = [
    {
      name: "wholast",
      variation: ["wholastartist", "wl", "gwl", "wholast", "wla"],
      description: "Shows who *last* scrobbled an artist",
    },
    VARIATIONS.global("wf", "wl", "wla"),
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    const whoLast = this.variationWasUsed("wholast");

    const { senderRequestable, senderLilacUser, senderUser } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
        fetchLilacUser: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const guildID = this.isGlobal() ? undefined : this.requiredGuild.id;

    const { whoFirstArtist: whoFirst, whoFirstArtistRank: whoFirstRank } =
      await this.lilacWhoKnowsService.whoFirstArtist(
        this.ctx,
        artistName,
        this.author.id,
        guildID,
        15,
        whoLast
      );

    await this.cacheUserInfo(whoFirst.rows.map((u) => u.user));

    const { rows, artist } = whoFirst;
    const { rank, totalListeners } = whoFirstRank;

    const userListenedDate = whoLast
      ? whoFirstRank.lastScrobbled
      : whoFirstRank.firstScrobbled;

    const description = new LineConsolidator().addLines(
      {
        shouldDisplay: artist && !!rows.length,
        string: displayNumberedList(
          rows.map(
            (wf) =>
              `${this.displayUser(wf.user, {
                customProfileLink: LastfmLinks.libraryArtistPage(
                  wf.user.username,
                  artist.name
                ),
              })} - ${this.displayScrobbleDate(
                convertLilacDate(whoLast ? wf.lastScrobbled : wf.firstScrobbled)
              )}`
          )
        ),
      },
      {
        shouldDisplay: rank > 15,
        string:
          `\n\`${rank}\` ` +
          bold(
            displayLink(
              this.payload.member?.nickname || this.payload.author.username,
              LastfmLinks.userPage(senderUser?.lastFMUsername!)
            )
          ) +
          `- **${this.displayScrobbleDate(convertLilacDate(userListenedDate))}`,
      },
      {
        shouldDisplay: !artist || rows.length === 0,
        string: "No one has scrobbled this artist",
      }
    );

    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataTitle} Who ${
          whoLast ? "last" : "first"
        } scrobbled ${bold(artist.name)}${this.isGlobal() ? " globally" : ""}?`
      )
      .setDescription(description)
      .setFooter(
        (
          `${displayNumber(
            totalListeners,
            this.isGlobal() ? "global listener" : "server listener"
          )}\n` + this.footerHelp(senderLilacUser)
        ).trim()
      )
      .setFooterIcon(
        this.isGlobal() ? this.gowonIconURL : this.guild?.iconURL() ?? undefined
      );

    await this.reply(embed);
  }

  private displayScrobbleDate(date: Date) {
    // Before February 13th, 2005
    const isPreDatedScrobbles = date.getTime() / 1000 < 1108368000;

    return displayDate(date) + (isPreDatedScrobbles ? " (or earlier)" : "");
  }
}
