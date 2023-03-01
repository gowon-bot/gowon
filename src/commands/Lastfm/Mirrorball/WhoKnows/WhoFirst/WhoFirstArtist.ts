import { MirrorballError } from "../../../../../errors/errors";
import { bold, italic } from "../../../../../helpers/discord";
import { LastfmLinks } from "../../../../../helpers/lastfm/LastfmLinks";
import { convertMirrorballDate } from "../../../../../helpers/mirrorball";
import { Variation } from "../../../../../lib/command/Command";
import { VARIATIONS } from "../../../../../lib/command/variations";
import {
  prefabArguments,
  prefabFlags,
} from "../../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../../lib/context/arguments/types";
import { Emoji } from "../../../../../lib/Emoji";
import { LineConsolidator } from "../../../../../lib/LineConsolidator";
import {
  displayDate,
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../../../lib/views/displays";
import { WhoKnowsBaseCommand } from "../WhoKnowsBaseCommand";
import {
  WhoFirstArtistConnector,
  WhoFirstArtistParams,
  WhoFirstArtistResponse,
} from "./connectors";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} satisfies ArgumentsMap;

export default class WhoFirstArtist extends WhoKnowsBaseCommand<
  WhoFirstArtistResponse,
  WhoFirstArtistParams,
  typeof args
> {
  connector = new WhoFirstArtistConnector();

  idSeed = "shasha garam";
  aliases = ["wf", "whofirst"];

  subcategory = "whofirst";
  description = "See who first scrobbled an artist";

  variations: Variation[] = [
    {
      name: "wholast",
      variation: ["wholastartist", "wl", "gwl", "wholast"],
      description: "Shows who *last* scrobbled an artist",
    },
    VARIATIONS.global("wf", "wl"),
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    const whoLast = this.variationWasUsed("wholast");

    const {
      senderRequestable,
      senderUser,
      senderMirrorballUser,
      senderUsername,
    } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
      fetchMirrorballUser: true,
    });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const response = await this.query({
      whoLast,
      artist: { name: artistName },
      settings: {
        guildID: this.isGlobal() ? undefined : this.requiredGuild.id,
        limit: 20,
      },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    await this.cacheUserInfo(response.whoFirstArtist.rows.map((u) => u.user));

    const { rows, artist } = response.whoFirstArtist;
    const { undated, senderUndated } = this.getUndated(response);

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        shouldDisplay: !!undated.length,
        string:
          italic(
            `${displayNumber(undated.length, "user")} with undated scrobbles`
          ) + "\n",
      },
      {
        shouldDisplay: senderUndated,
        string: `\`${rows.length > 9 ? " " : ""}•\`. ${bold(
          displayLink(
            this.ctx.authorMember.nickname || this.author.username,
            LastfmLinks.libraryArtistPage(senderUsername, artist.name)
          )
        )} - \`(undated)\``,
      },
      {
        shouldDisplay: artist && !!rows.length,
        string: displayNumberedList(
          rows.map(
            (wk) =>
              `${this.displayUser(wk.user, {
                customProfileLink: LastfmLinks.libraryArtistPage(
                  wk.user.username,
                  artist.name
                ),
              })} - ${this.displayScrobbleDate(
                convertMirrorballDate(wk.scrobbledAt)
              )}`
          )
        ),
      },
      {
        shouldDisplay: !artist || rows.length === 0,
        string: "No one has scrobbled this artist",
      }
    );

    const embed = this.whoKnowsEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataTitle} Who ${
          whoLast ? "last" : "first"
        } scrobbled ${bold(artist.name)}${this.isGlobal() ? " globally" : ""}?`
      )
      .setDescription(lineConsolidator.consolidate())
      .setFooter({ text: this.footerHelp(senderUser, senderMirrorballUser) });

    await this.send(embed);
  }

  private getUndated(response: WhoFirstArtistResponse): {
    senderUndated: boolean;
    undated: string[];
  } {
    const filtered = response.whoFirstArtist.undated.filter(
      (u) => u.user.discordID !== this.author.id
    );

    return {
      undated: filtered.map((u) => u.user.discordID),
      senderUndated: filtered.length !== response.whoFirstArtist.undated.length,
    };
  }

  private displayScrobbleDate(date: Date) {
    // Before February 13th, 2005
    const isPreDatedScrobbles = date.getTime() / 1000 < 1108368000;

    return displayDate(date) + (isPreDatedScrobbles ? " (or earlier)" : "");
  }
}
