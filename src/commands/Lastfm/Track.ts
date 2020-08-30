import { TrackEmbed } from "../../helpers/Embeds";
import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Track extends LastFMBaseCommand {
  description = "Searches and shows a track";
  usage = ["", "artist | track", "query string"];
  arguments: Arguments = {
    inputs: {
      querystring: { index: { start: 0 } },
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
  };

  async run() {
    let track = this.parsedArguments.track as string,
      artist = this.parsedArguments.artist as string,
      querystring = this.parsedArguments.querystring as string;

    if (querystring.includes("|") || !querystring.trim()) {
      if (!artist || !track) {
        let { senderUsername } = await this.parseMentionedUsername();

        let nowPlaying = await this.lastFMService.nowPlayingParsed(
          senderUsername
        );

        if (!artist) artist = nowPlaying.artist;
        if (!track) track = nowPlaying.name;
      }

      let trackInfo = await this.lastFMService.trackInfo({ artist, track });

      let embed = TrackEmbed({ 
        ...trackInfo,
        image: trackInfo.album.image,
      }).setAuthor(
        `Track for ${this.message.author.username}`,
        this.message.author.avatarURL() || ""
      );

      await this.send(embed);
    } else {
    }
  }
}
