import { Message, MessageEmbed } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { dateTimeDisplay, ucFirst } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";

export default class LastScrobbled extends LastFMBaseCommand {
  description = "Shows the last time you scrobbled a song";
  aliases = ["last"];
  usage = ["", "artist | track @user"];

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
      senderUsername,
      username,
      perspective,
    } = await this.parseMentionedUsername(message);

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
        artist = (await this.lastFMService.artistInfo({ artist })).name;
      }
      if (!track) {
        track = nowPlaying.name;
      } else {
        track = (await this.lastFMService.trackInfo({ artist, track })).name;
      }
    }

    let lastScrobbled = await this.lastFMService.scraper.lastScrobbled(
      username,
      artist,
      track
    );

    // if ()

    let embed = new MessageEmbed().setDescription(
      `${ucFirst(
        perspective.name
      )} last scrobbled ${track.bold()} by ${artist.bold()} at ${dateTimeDisplay(
        lastScrobbled
      ).bold()}`
    );

    await message.channel.send(embed);
  }
}
