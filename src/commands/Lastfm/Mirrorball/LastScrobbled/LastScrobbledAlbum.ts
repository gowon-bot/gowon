import { MirrorballError } from "../../../../errors/errors";
import { bold, italic } from "../../../../helpers/discord";
import { convertMirrorballDate } from "../../../../helpers/mirrorball";
import { Variation } from "../../../../lib/command/Command";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/Emoji";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { displayDate } from "../../../../lib/views/displays";
import {
  LastScrobbledConnector,
  LastScrobbledParams,
  LastScrobbledResponse,
} from "./connector";

const args = {
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export default class LastScrobbledAlbum extends MirrorballBaseCommand<
  LastScrobbledResponse,
  LastScrobbledParams,
  typeof args
> {
  connector = new LastScrobbledConnector();

  idSeed = "shasha chaki";

  aliases = ["lastl", "lal", "lastalbum"];
  variations: Variation[] = [
    { name: "first", variation: ["firstl", "fl", "fal", "firstalbum"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled an album";

  arguments = args;

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.album,
      reverseLookup: { required: true },
      indexedRequired: true,
    });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(this.ctx, senderRequestable, {
        redirect: true,
      });

    const response = await this.query({
      track: { album: { name: albumName, artist: { name: artistName } } },
      user: { discordID: dbUser.discordID },
      sort: this.variationWasUsed("first")
        ? "scrobbled_at asc"
        : "scrobbled_at desc",
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const [play] = response.plays.plays;

    const embed = this.newEmbed()
      .setAuthor(
        this.generateEmbedAuthor(
          (this.variationWasUsed("first") ? "First" : "Last") + " scrobbled"
        )
      )
      .setDescription(
        `${Emoji.usesIndexedDataDescription} ${perspective.upper.name} ${
          this.variationWasUsed("first") ? "first" : "last"
        } scrobbled ${italic(play.track.album.name)} by ${bold(
          play.track.artist.name
        )} on ${displayDate(convertMirrorballDate(play.scrobbledAt))}`
      );

    await this.send(embed);
  }
}
