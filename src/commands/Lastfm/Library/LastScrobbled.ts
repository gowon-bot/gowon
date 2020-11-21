import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { dateTimeDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LinkGenerator } from "../../../helpers/lastFM";

export default class LastScrobbled extends LastFMBaseCommand {
  description = "Shows the last time you scrobbled a song";
  aliases = ["last"];
  usage = ["", "artist | track @user"];
  subcategory = "library";

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

    let { senderUsername, username, perspective } = await this.parseMentions({
      senderRequired: !artist || !track,
    });

    if (artist && track) {
      let albumInfo = await this.lastFMService.trackInfo({ artist, track });
      artist = albumInfo.artist.name;
      track = albumInfo.name;
    }

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) {
        artist = nowPlaying.artist;
      } else {
        artist = await this.lastFMService.correctArtist({ artist });
      }
      if (!track) {
        track = nowPlaying.name;
      } else {
        let corrected = await this.lastFMService.correctTrack({
          artist,
          track,
        });
        track = corrected.track;
        artist = corrected.artist;
      }
    }

    let lastScrobbled = await this.lastFMService.scraper.lastScrobbled(
      username,
      artist,
      track
    );

    if (!lastScrobbled)
      throw new LogicError(
        `${perspective.plusToHave} not scrobbled that track!`
      );

    let embed = this.newEmbed()
      .setAuthor(
        this.message.author.username,
        this.message.author.avatarURL() || "",
        LinkGenerator.libraryTrackPage(username, artist, track)
      )
      .setDescription(
        `${
          perspective.upper.name
        } last scrobbled ${track.strong()} by ${artist.strong()} ${
          lastScrobbled instanceof Date
            ? `at ${dateTimeDisplay(lastScrobbled).strong()}`
            : lastScrobbled
        }`
      );

    await this.send(embed);
  }
}
