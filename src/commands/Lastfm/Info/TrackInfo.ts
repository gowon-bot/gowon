import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";

export default class TrackInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["tri"];
  description = "Display some information about a track";
  usage = ["", "artist | track"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

    if (!artist || !track) {
      let { senderUsername } = await this.parseMentionedUsername(message);

      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let trackInfo = await this.lastFMService.trackInfo({ artist, track });

    this.tagConsolidator.addTags(trackInfo.toptags.tag);

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
          (this.tagConsolidator.hasTags()
            ? "\n\n**Tags:** " + this.tagConsolidator.consolidate().join(" ‧ ")
            : "")
      );

    message.channel.send(embed);
  }
}
