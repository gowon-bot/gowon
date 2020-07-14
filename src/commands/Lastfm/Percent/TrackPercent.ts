import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackPercent extends LastFMBaseCommand {
  aliases = ["tpct"];
  description =
    "Shows you the percentage of an artist's scrobbles are made up of a certain track";
  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
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

    let [artistInfo, trackInfo] = await Promise.all([
      this.lastFMService.artistInfo(artist, username),
      this.lastFMService.trackInfo(artist, track, username),
    ]);

    await message.reply(
      `${perspective.possessive} ${numberDisplay(
        trackInfo.userplaycount,
        "play"
      )} of ${trackInfo.name.bold()} make ${calculatePercent(
        trackInfo.userplaycount,
        artistInfo.stats.userplaycount
      ).bold()}% of ${perspective.possesivePronoun} ${artistInfo.name.bold()} scrobbles`
    );
  }
}
