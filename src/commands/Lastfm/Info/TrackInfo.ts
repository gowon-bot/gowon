import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";

export default class TrackInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["tri"];
  description = "Display some information about a track";
  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      trackName = this.parsedArguments.track as string;

    if (!artist || !trackName) {
      let { senderUsername } = await this.parseMentionedUsername(message);

      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!trackName) trackName = nowPlaying.name;
    }

    let trackInfo = await this.lastFMService.trackInfo(artist, trackName);

    let embed = new MessageEmbed()
      .setTitle(trackInfo.name.italic() + " by " + trackInfo.artist.name.bold())
      .addFields(
        {
          name: "Listeners",
          value: numberDisplay(trackInfo.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: numberDisplay(trackInfo.playcount),
          inline: true,
        }
      )
      .setURL(trackInfo.url)
      .setDescription(
        (trackInfo.duration.toInt()
          ? `_${numberDisplay(
              Math.ceil(trackInfo.duration.toInt() / 60000),
              "minute"
            )}_ - `
          : "") +
          (trackInfo.album
            ? ` from the album ${trackInfo.album.title.italic()}`
            : "") +
          (trackInfo.wiki
            ? "\n\n" + this.scrubReadMore(trackInfo.wiki?.summary.trimRight())
            : "") +
          (trackInfo.toptags.tag.length
            ? "\n\n**Tags:** " +
              trackInfo.toptags.tag.map((t) => t.name).join(" ‧ ")
            : "")
      );

    message.channel.send(embed);
  }
}
