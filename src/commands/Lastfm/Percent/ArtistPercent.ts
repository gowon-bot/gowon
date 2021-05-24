import { Arguments } from "../../../lib/arguments/arguments";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class ArtistPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "twice tzuyu";

  aliases = ["apct"];
  description =
    "Shows you what percentage of your total scrobbles are made up by a certain artist";
  subcategory = "percents";
  usage = ["", "artist"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist)
      artist = (await this.lastFMService.nowPlaying(senderUsername)).artist;

    let [artistInfo, userInfo] = await Promise.all([
      this.lastFMService.artistInfo({ artist, username }),
      this.lastFMService.userInfo({ username }),
    ]);

    await this.traditionalReply(
      `${perspective.possessive} ${displayNumber(
        artistInfo.userPlaycount,
        "play"
      )} of ${artistInfo.name.strong()} represent ${calculatePercent(
        artistInfo.userPlaycount,
        userInfo.scrobbleCount
      ).strong()}% of ${perspective.possessivePronoun} total scrobbles`
    );
  }
}
