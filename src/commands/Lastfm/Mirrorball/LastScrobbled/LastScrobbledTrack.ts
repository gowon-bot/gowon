import { IndexerError } from "../../../../errors";
import { convertIndexerDate } from "../../../../helpers/mirrorball";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Variation } from "../../../../lib/command/BaseCommand";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { displayDate } from "../../../../lib/views/displays";
import {
  LastScrobbledConnector,
  LastScrobbledParams,
  LastScrobbledResponse,
} from "./connector";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
} as const;

export default class LastScrobbledTrack extends MirrorballBaseCommand<
  LastScrobbledResponse,
  LastScrobbledParams,
  typeof args
> {
  connector = new LastScrobbledConnector();

  idSeed = "shasha hwi a";

  aliases = ["lastt", "lt"];
  variations: Variation[] = [{ name: "first", variation: ["firstl", "ft"] }];

  subcategory = "library";
  description = "Shows the last time you scrobbled an track";

  rollout = {
    guilds: this.mirrorballGuilds,
  };

  arguments: Arguments = args;

  async run() {
    const { senderRequestable, senderUser, dbUser, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
        reverseLookup: { required: true },
      });

    const user = (dbUser || senderUser)!;

    await this.throwIfNotIndexed(user, perspective);

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(senderRequestable, true);

    const response = await this.query({
      track: { name: trackName, artist: { name: artistName } },
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
        } scrobbled ${play.track.name.italic()} by ${play.track.artist.name.strong()} on ${displayDate(
          convertIndexerDate(play.scrobbledAt)
        )}`
      );

    await this.send(embed);
  }
}
