import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";

export default class AlbumInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["ali", "li"];
  description = "Display some information about an album";
  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      albumName = this.parsedArguments.album as string;

    if (!artist || !albumName) {
      let { senderUsername } = await this.parseMentionedUsername(message);
      
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!albumName) albumName = nowPlaying.album;
    }

    let albumInfo = await this.lastFMService.albumInfo(artist, albumName);
    let albumDuration = albumInfo.tracks.track.reduce(
      (sum, t) => sum + t.duration.toInt(),
      0
    );

    let embed = new MessageEmbed()
      .setTitle(albumInfo.name.italic() + " by " + albumInfo.artist.bold())
      .addFields(
        {
          name: "Listeners",
          value: numberDisplay(albumInfo.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: numberDisplay(albumInfo.playcount),
          inline: true,
        }
      )
      .setURL(albumInfo.url)
      .setDescription(
        (albumInfo.tracks.track.length
          ? `_${numberDisplay(albumInfo.tracks.track.length, "track")}` +
            ` (${numberDisplay(Math.ceil(albumDuration / 60), "minute")})_\n\n`
          : "") +
          (albumInfo.wiki
            ? this.scrubReadMore(albumInfo.wiki?.summary.trimRight())
            : "") +
          (albumInfo.tags.tag.length
            ? "\n\n**Tags:** " +
              albumInfo.tags.tag.map((t) => t.name).join(" ‧ ")
            : "")
      );

    message.channel.send(embed);
  }
}
