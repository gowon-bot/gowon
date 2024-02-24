import { bold } from "../../../helpers/discord";
import { toInt } from "../../../helpers/lastfm/";
import { calculatePercent } from "../../../helpers/stats";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

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
      await this.getMentions({
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

    const embed = this.minimalEmbed().setDescription(
      `Last.fm has scrobbled ${bold(artistDetails.name)} ${displayNumber(
        artistDetails.globalPlaycount,
        "time"
      )}${
        toInt(artistDetails.userPlaycount) > 0
          ? `. ${perspective.upper.plusToHave} ${displayNumber(
              artistDetails.userPlaycount,
              "scrobble"
            )} ${parseFloat(percentage) > 0 ? `(${percentage}%)` : ""}.`
          : ""
      }`
    );

    await this.reply(embed);
  }
}
