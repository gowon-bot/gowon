import { MirrorballError } from "../../../../errors/errors";
import { convertMirrorballDate } from "../../../../helpers/mirrorball";
import { Variation } from "../../../../lib/command/Command";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { displayDate } from "../../../../lib/views/displays";
import {
  LastScrobbledConnector,
  LastScrobbledParams,
  LastScrobbledResponse,
} from "./connector";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { bold, italic } from "../../../../helpers/discord";
import { Emoji } from "../../../../lib/Emoji";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export default class LastScrobbledTrack extends MirrorballBaseCommand<
  LastScrobbledResponse,
  LastScrobbledParams,
  typeof args
> {
  connector = new LastScrobbledConnector();

  idSeed = "shasha hwi a";

  aliases = ["lastt", "lasttrack", "lt"];
  variations: Variation[] = [
    { name: "first", variation: ["firstt", "ft", "firsttrack"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled a track";

  arguments = args;

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.track,
      reverseLookup: { required: true },
      requireIndexed: true,
    });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable, {
        redirect: true,
      });

    const response = await this.query({
      track: { name: trackName, artist: { name: artistName } },
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
        `${Emoji.usesIndexedDataDescription} ${perspective.upper.name} ${this.variationWasUsed("first") ? "first" : "last"
        } scrobbled ${italic(play.track.name)} by ${bold(
          play.track.artist.name
        )} on ${displayDate(convertMirrorballDate(play.scrobbledAt))}`
      );

    await this.send(embed);
  }
}
