import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class ArtistPlays extends LastFMBaseCommand {
  aliases = ["ap", "p"];
  description = "Shows you how many plays you have of a given artist";
  subcategory = "plays";
  usage = ["", "artist @user"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
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

    this.send(
      `${perspective.upper.plusToHave} **${numberDisplay(
        artistDetails.stats.userplaycount,
        "**scrobble"
      )} of ${artistDetails.name.bold()}`
    );
  }
}
