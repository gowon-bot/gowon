import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class GlobalArtistPlays extends LastFMBaseCommand {
  aliases = ["gap", "gp", "globalp"];
  description = "Shows you how many plays Last.fm has of a given artist";
  subcategory = "plays";
  usage = ["", "artist"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername();

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username,
    });

    this.send(
      `Last.fm has scrobbled ${artistDetails.name} ${numberDisplay(
        artistDetails.stats.playcount,
        "time"
      ).bold()}${
        artistDetails.stats.userplaycount.toInt() > 0
          ? ` (${perspective.plusToHave} ${numberDisplay(
              artistDetails.stats.userplaycount,
              "scrobble"
            ).bold()})`
          : ""
      }`
    );
  }
}
