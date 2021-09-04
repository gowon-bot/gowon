import { MirrorballError } from "../../../../../errors";
import { convertMirrorballDate } from "../../../../../helpers/mirrorball";
import { Arguments } from "../../../../../lib/arguments/arguments";
import { FLAGS } from "../../../../../lib/arguments/flags";
import { Variation } from "../../../../../lib/command/BaseCommand";
import {
  displayDate,
  displayNumberedList,
} from "../../../../../lib/views/displays";
import { WhoKnowsBaseCommand } from "../WhoKnowsBaseCommand";
import {
  WhoFirstArtistConnector,
  WhoFirstArtistParams,
  WhoFirstArtistResponse,
} from "./connectors";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  flags: {
    noRedirect: FLAGS.noRedirect,
  },
} as const;

export default class WhoFirstArtist extends WhoKnowsBaseCommand<
  WhoFirstArtistResponse,
  WhoFirstArtistParams,
  typeof args
> {
  connector = new WhoFirstArtistConnector();

  idSeed = "shasha garam";

  aliases = ["wf"];

  variations: Variation[] = [
    {
      name: "wholast",
      variation: ["wholastartist", "wl"],
      description: "Shows who *last* scrobbled an artist",
    },
  ];

  description = "See who first scrobbled an artist";

  subcategory = "whofirst";

  arguments: Arguments = args;

  async run() {
    const whoLast = this.variationWasUsed("wholast");

    let { senderRequestable, senderUser, senderMirrorballUser } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
        fetchMirrorballUser: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      senderRequestable,
      !this.parsedArguments.noRedirect
    );

    const response = await this.query({
      whoLast,
      artist: { name: artistName },
      settings: {
        guildID: this.isGlobal() ? "" : this.guild.id,
        limit: 20,
      },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    await this.cacheUserInfo(response.whoFirstArtist.rows.map((u) => u.user));

    const { rows, artist } = response.whoFirstArtist;

    const embed = this.whoKnowsEmbed()
      .setTitle(
        `Who ${whoLast ? "last" : "first"} scrobbled ${artist.name.strong()}${
          this.isGlobal() ? " globally" : ""
        }?`
      )
      .setDescription(
        !artist || rows.length === 0
          ? `No one has scrobbled this artist`
          : displayNumberedList(
              rows.map(
                (wk) =>
                  `${this.displayUser(wk.user)} - ${displayDate(
                    convertMirrorballDate(wk.scrobbledAt)
                  )}`
              )
            )
      )
      .setFooter(this.footerHelp(senderUser, senderMirrorballUser));

    await this.send(embed);
  }
}
