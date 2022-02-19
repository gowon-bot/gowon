import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { calculatePercent } from "../../../helpers/stats";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
} as const;

export default class GlobalArtistPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy yuna";

  aliases = ["gap", "gp", "globalp"];
  description =
    "Shows you how many plays Last.fm has of a given artist for all users";
  subcategory = "plays";
  usage = ["", "artist"];

  arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const artistDetails = await this.lastFMService.artistInfo(this.ctx, {
      artist,
      username: requestable,
    });

    const percentage = calculatePercent(
      artistDetails.userPlaycount,
      artistDetails.globalPlaycount
    );

    await this.send(
      `Last.fm has scrobbled ${artistDetails.name} ${displayNumber(
        artistDetails.globalPlaycount,
        "time"
      )}${
        toInt(artistDetails.userPlaycount) > 0
          ? `. ${perspective.upper.plusToHave} ${displayNumber(
              artistDetails.userPlaycount,
              "scrobble"
            )} ${parseFloat(percentage) > 0 ? `(${percentage}%)` : ""}`
          : ""
      }`
    );
  }
}
