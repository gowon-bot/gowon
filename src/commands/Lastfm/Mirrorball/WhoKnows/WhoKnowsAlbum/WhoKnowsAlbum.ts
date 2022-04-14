import { MirrorballError } from "../../../../../errors/errors";
import { bold, italic } from "../../../../../helpers/discord";
import { Variation } from "../../../../../lib/command/Command";
import { VARIATIONS } from "../../../../../lib/command/variations";
import { prefabArguments } from "../../../../../lib/context/arguments/prefabArguments";
import {
  displayNumber,
  displayNumberedList,
} from "../../../../../lib/views/displays";
import { WhoKnowsBaseCommand } from "../WhoKnowsBaseCommand";
import {
  WhoKnowsAlbumConnector,
  WhoKnowsAlbumParams,
  WhoKnowsAlbumResponse,
} from "./WhoKnowsAlbum.connector";

const args = {
  ...prefabArguments.album,
} as const;

export default class WhoKnowsAlbum extends WhoKnowsBaseCommand<
  WhoKnowsAlbumResponse,
  WhoKnowsAlbumParams,
  typeof args
> {
  connector = new WhoKnowsAlbumConnector();

  idSeed = "redsquare green";

  subcategory = "whoknows";
  description = "See who knows an album";
  aliases = ["wkl", "wka", "fmwka"];

  variations: Variation[] = [
    VARIATIONS.update("wkl", "wka"),
    VARIATIONS.global("wkl", "wka"),
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    let { senderRequestable, senderUser, senderMirrorballUser } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
        fetchMirrorballUser: true,
      });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(this.ctx, senderRequestable, true);

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(this.author.id);
    }

    const response = await this.query({
      album: { name: albumName, artist: { name: artistName } },
      settings: {
        guildID: this.isGlobal() ? undefined : this.requiredGuild.id,
        limit: 20,
      },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { rows, album } = response.whoKnowsAlbum;

    await this.cacheUserInfo(response.whoKnowsAlbum.rows.map((u) => u.user));

    const embed = this.whoKnowsEmbed()
      .setTitle(
        `Who knows ${italic(album.name)} by ${bold(album.artist.name)}${
          this.isGlobal() ? " globally" : ""
        }?`
      )
      .setDescription(
        !album || rows.length === 0
          ? `No one knows this album`
          : displayNumberedList(
              rows.map(
                (wk) =>
                  `${this.displayUser(wk.user)} - **${displayNumber(
                    wk.playcount,
                    "**play"
                  )}`
              )
            )
      )
      .setFooter({ text: this.footerHelp(senderUser, senderMirrorballUser) });

    await this.send(embed);
  }
}
