import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class AlbumPercent extends LastFMBaseCommand {
  aliases = ["lpct", "alpct"];
  description =
    "Shows you the percentage of an artist's scrobbles are made up of a certain album";
  subcategory = "percents";
  usage = ["", "artist | album"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
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
      album = this.parsedArguments.album as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let [artistInfo, albumInfo] = await Promise.all([
      this.lastFMService.artistInfo(artist, username),
      this.lastFMService.albumInfo(artist, album, username),
    ]);

    await message.reply(
      `${perspective.possessive} ${numberDisplay(
        albumInfo.userplaycount,
        "play"
      )} of ${albumInfo.name.bold()} make ${calculatePercent(
        albumInfo.userplaycount,
        artistInfo.stats.userplaycount
      ).bold()}% of ${
        perspective.possesivePronoun
      } ${artistInfo.name.bold()} scrobbles`
    );
  }
}
