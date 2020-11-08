import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { calculatePercent } from "../../../helpers/stats";

export default class GlobalArtistPlays extends LastFMBaseCommand {
  aliases = ["gap", "gp", "globalp"];
  description = "Shows you how many plays Last.fm has of a given artist for all users";
  subcategory = "plays";
  usage = ["", "artist"];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username,
    });

    let percentage = calculatePercent(
      artistDetails.stats.userplaycount,
      artistDetails.stats.playcount
    );

    this.send(
      `Last.fm has scrobbled ${artistDetails.name} ${numberDisplay(
        artistDetails.stats.playcount,
        "time"
      )}${
        artistDetails.stats.userplaycount.toInt() > 0
          ? `. ${perspective.upper.plusToHave} ${numberDisplay(
              artistDetails.stats.userplaycount,
              "scrobble"
            )} ${parseFloat(percentage) > 0 ? `(${percentage}%)` : ""}`
          : ""
      }`
    );
  }
}
