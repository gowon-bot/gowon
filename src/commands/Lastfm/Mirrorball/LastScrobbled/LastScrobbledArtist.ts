import { IndexerError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  LastScrobbledConnector,
  LastScrobbledParams,
  LastScrobbledResponse,
} from "./connector";
import { displayDate } from "../../../../lib/views/displays";
import { Variation } from "../../../../lib/command/BaseCommand";
import { convertIndexerDate } from "../../../../helpers/mirrorball";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class LastScrobbledArtist extends MirrorballBaseCommand<
  LastScrobbledResponse,
  LastScrobbledParams,
  typeof args
> {
  connector = new LastScrobbledConnector();

  idSeed = "shasha wanlim";

  aliases = ["last", "lasta", "la"];
  variations: Variation[] = [
    { name: "first", variation: ["first", "firsta", "fa"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled an artist";

  rollout = {
    guilds: this.mirrorballGuilds,
  };

  arguments: Arguments = args;

  async run() {
    const { senderUser, senderRequestable, dbUser, perspective } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
        reverseLookup: { required: true },
      });

    const user = (dbUser || senderUser)!;

    await this.throwIfNotIndexed(user, perspective);

    const artistName = await this.lastFMArguments.getArtist(
      senderRequestable,
      true
    );

    const response = await this.query({
      track: { artist: { name: artistName } },
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
        } scrobbled ${play.track.artist.name.strong()} on ${displayDate(
          convertIndexerDate(play.scrobbledAt)
        )}`
      );

    await this.send(embed);
  }
}
