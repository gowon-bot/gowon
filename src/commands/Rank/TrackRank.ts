import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";

export default class TrackRank extends BaseCommand {
  aliases = ["tra", "tr"];
  description = "Shows what rank the track is at in your top 1000 tracks";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "the user to lookup" },
    },
    inputs: {
      artist: {
        index: 0,
        splitOn: "|",
      },
      track: {
        index: 1,
        splitOn: "|",
      },
    },
  };

  async run(message: Message) {
    let track = this.parsedArguments.track as string,
      artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!track || !artist) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let topTracks = await this.lastFMService.topTracks(username, 1000);

    let rank = topTracks.track.findIndex(
      (a) =>
        a.name.toLowerCase() === track.toLowerCase() &&
        a.artist.name.toLowerCase() === artist.toLowerCase()
    );

    if (rank === -1) {
      await message.reply(
        `that track wasn't found in ${perspective.possessive} top 1000 tracks`
      );
    } else {
      await message.reply(
        `**${topTracks.track[rank].name}** by ${
          topTracks.track[rank].artist.name
        } is ranked **#${rank + 1}** in ${
          perspective.possessive
        } top 1,000 tracks with ${topTracks.track[rank].playcount} plays`
      );
    }
  }
}
