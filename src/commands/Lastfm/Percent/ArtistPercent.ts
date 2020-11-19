import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class ArtistPercent extends LastFMBaseCommand {
  aliases = ["apct"];
  description =
    "Shows you what percentage of your total scrobbles are made up by a certain artist";
  subcategory = "percents";
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

    if (!artist)
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;

    let [artistInfo, userInfo] = await Promise.all([
      this.lastFMService.artistInfo({ artist, username }),
      this.lastFMService.userInfo({ username }),
    ]);

    await this.reply(
      `${perspective.possessive} ${numberDisplay(
        artistInfo.stats.userplaycount,
        "play"
      )} of ${artistInfo.name.bold()} represent ${calculatePercent(
        artistInfo.stats.userplaycount,
        userInfo.playcount
      ).bold()}% of ${perspective.possessivePronoun} total scrobbles`
    );
  }
}
