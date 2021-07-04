import { IndexerError } from "../../../../errors";
import { convertIndexerDate } from "../../../../helpers/mirrorball";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Variation } from "../../../../lib/command/BaseCommand";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import { displayDate } from "../../../../lib/views/displays";
import {
  LastScrobbledConnector,
  LastScrobbledParams,
  LastScrobbledResponse,
} from "./connector";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
} as const;

export default class LastScrobbledAlbum extends IndexingBaseCommand<
  LastScrobbledResponse,
  LastScrobbledParams,
  typeof args
> {
  connector = new LastScrobbledConnector();

  idSeed = "shasha chaki";

  aliases = ["lastl", "lal"];
  variations: Variation[] = [
    { name: "first", variation: ["firstl", "fl", "fal"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled an album";

  rollout = {
    guilds: this.indexerGuilds,
  };

  arguments: Arguments = args;

  async run() {
    const { senderRequestable, senderUser, dbUser, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
        reverseLookup: { required: true },
      });

    const user = (dbUser || senderUser)!;

    await this.throwIfNotIndexed(user, perspective);

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(senderRequestable, true);

    const response = await this.query({
      track: { album: { name: albumName, artist: { name: artistName } } },
      user: { discordID: user.discordID },
      sort: this.variationWasUsed("first")
        ? "scrobbled_at asc"
        : "scrobbled_at desc",
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
    }

    const [play] = response.plays;

    const embed = this.newEmbed()
      .setAuthor(
        ...this.generateEmbedAuthor(
          (this.variationWasUsed("first") ? "First" : "Last") + " scrobbled"
        )
      )
      .setDescription(
        `${perspective.upper.name} ${
          this.variationWasUsed("first") ? "first" : "last"
        } scrobbled ${play.track.album.name.italic()} by ${play.track.artist.name.strong()} on ${displayDate(
          convertIndexerDate(play.scrobbledAt)
        )}`
      );

    await this.send(embed);
  }
}
