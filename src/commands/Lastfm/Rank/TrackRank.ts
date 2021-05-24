import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
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
  mentions: standardMentions,
} as const;

export default class TrackRank extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature seline";

  aliases = ["tra", "tr"];
  description = "Shows what rank a track is at in your top 1000 tracks";
  subcategory = "ranks";
  usage = ["", "artist | track @user"];

  arguments: Arguments = args;

  async run() {
    let track = this.parsedArguments.track,
      artist = this.parsedArguments.artist;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !track || !artist,
    });

    if (!track || !artist) {
      let nowPlaying = await this.lastFMService.nowPlaying(senderUsername);

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let topTracks = await this.lastFMService.topTracks({
      username,
      limit: 1000,
    });

    let rank = topTracks.tracks.findIndex(
      (a) =>
        a.name.toLowerCase() === track!.toLowerCase() &&
        a.artist.name.toLowerCase() === artist!.toLowerCase()
    );

    if (rank === -1) {
      await this.traditionalReply(
        `that track wasn't found in ${
          perspective.possessive
        } top ${displayNumber(topTracks.tracks.length, "track")}`
      );
    } else {
      await this.traditionalReply(
        `${topTracks.tracks[rank].name.strong()} by ${
          topTracks.tracks[rank].artist.name
        } is ranked #${displayNumber(rank + 1).strong()} with ${displayNumber(
          topTracks.tracks[rank].userPlaycount,
          "play"
        ).strong()}`
      );
    }
  }
}
