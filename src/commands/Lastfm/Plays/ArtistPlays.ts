import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay, ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

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
      `${ucFirst(perspective.plusToHave)} **${numberDisplay(
        artistDetails.stats.userplaycount,
        "**scrobble"
      )} of **${artistDetails.name}**`
    );
  }
}
