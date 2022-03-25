import { MirrorballError } from "../../../../errors/errors";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  LastScrobbledConnector,
  LastScrobbledParams,
  LastScrobbledResponse,
} from "./connector";
import { displayDate } from "../../../../lib/views/displays";
import { Variation } from "../../../../lib/command/Command";
import { convertMirrorballDate } from "../../../../helpers/mirrorball";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../../lib/context/arguments/prefabArguments";
import { bold } from "../../../../helpers/discord";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} as const;

export default class LastScrobbledArtist extends MirrorballBaseCommand<
  LastScrobbledResponse,
  LastScrobbledParams,
  typeof args
> {
  connector = new LastScrobbledConnector();

  idSeed = "shasha wanlim";

  aliases = ["last", "lasta", "la", "lastartist"];

  variations: Variation[] = [
    { name: "first", variation: ["first", "firsta", "fa"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled an artist";

  arguments = args;

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
      reverseLookup: { required: true },
      requireIndexed: true,
    });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      !this.parsedArguments.noRedirect
    );

    const response = await this.query({
      track: { artist: { name: artistName } },
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
        `${perspective.upper.name} ${
          this.variationWasUsed("first") ? "first" : "last"
        } scrobbled ${bold(play.track.artist.name)} on ${displayDate(
          convertMirrorballDate(play.scrobbledAt)
        )}`
      );

    await this.send(embed);
  }
}
