import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { calculatePercent } from "../../../helpers/stats";
import { toInt } from "../../../helpers/lastFM";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class GlobalArtistPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy yuna";

  aliases = ["gap", "gp", "globalp"];
  description =
    "Shows you how many plays Last.fm has of a given artist for all users";
  subcategory = "plays";
  usage = ["", "artist"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMConverter.artistInfo({
      artist,
      username,
    });

    let percentage = calculatePercent(
      artistDetails.userPlaycount,
      artistDetails.globalPlaycount
    );

    await this.send(
      `Last.fm has scrobbled ${artistDetails.name} ${numberDisplay(
        artistDetails.globalPlaycount,
        "time"
      )}${
        toInt(artistDetails.userPlaycount) > 0
          ? `. ${perspective.upper.plusToHave} ${numberDisplay(
              artistDetails.userPlaycount,
              "scrobble"
            )} ${parseFloat(percentage) > 0 ? `(${percentage}%)` : ""}`
          : ""
      }`
    );
  }
}
