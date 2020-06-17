import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";
import { calculatePercent } from "../../helpers/stats";

export default class TrackPercent extends BaseCommand {
  aliases = ["tpct"];
  description =
    "Shows you the percentage of an artist's scrobbles are made up of a certain track";
  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
    mentions: {
      0: { name: "user", description: "the user to lookup" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    console.log(artist, track)

    let [artistInfo, trackInfo] = await Promise.all([
      this.lastFMService.artistInfo(artist, username),
      this.lastFMService.trackInfo(artist, track, username),
    ]);

    await message.reply(
      `${perspective.possessive} ${numberDisplay(
        trackInfo.userplaycount,
        "play"
      )} of **${trackInfo.name}** make **${calculatePercent(
        trackInfo.userplaycount,
        artistInfo.stats.userplaycount
      )}%** of ${perspective.possesivePronoun} **${artistInfo.name}** scrobbles`
    );
  }
}
