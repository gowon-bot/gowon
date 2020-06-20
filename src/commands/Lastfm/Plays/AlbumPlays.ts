import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay, ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class AlbumPlays extends LastFMBaseCommand {
  aliases = ["alp", "lp"];
  description = "Shows you how many plays you have of a given album";

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
      albumName = this.parsedArguments.album as string;


    let {
      senderUsername,
      username,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist || !albumName) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!albumName) albumName = nowPlaying.album;
    }

    let albumDetails = await this.lastFMService.albumInfo(
      artist,
      albumName,
      username
    );

    message.channel.send(
      `${ucFirst(perspective.plusToHave)} ${numberDisplay(
        albumDetails.userplaycount,
        "scrobble"
      )} of **${albumDetails.name}** by ${albumDetails.artist}`
    );
  }
}
