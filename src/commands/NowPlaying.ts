import { BaseCommand } from "../BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { LinkGenerator, parseLastFMTrackResponse } from "../helpers/lastFM";
import { ConnectionOptionsReader } from "typeorm";

export class NowPlaying extends BaseCommand {
  aliases = ["np", "fm"];
  variations = {
    fmv: "Displays more information",
  };
  description = "Displays the now playing or last played track in last.fm";

  async run(message: Message, runAs?: string) {
    console.log(runAs);

    let username = await this.usersService.getUsername(message.author.id);

    let response = await this.lastFMService.nowPlaying(username);

    let nowPlaying = response.recenttracks.track[0];
    let track = parseLastFMTrackResponse(nowPlaying);

    let links = LinkGenerator.generateTrackLinksForEmbed(nowPlaying);

    let nowPlayingEmbed = new MessageEmbed()
      .setColor("black")
      .setAuthor(`Now Playing for ${response.recenttracks["@attr"].user}`)
      .setTitle(track.name)
      .setURL(LinkGenerator.trackPage(track.artist, track.name))
      .setDescription(
        `by **${links.artist}**` + (track.album ? ` from _${links.album}_` : "")
      )
      .setThumbnail(
        nowPlaying.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    if (runAs === "fmv") {
      let [artistInfo, trackInfo] = await Promise.all([
        this.lastFMService.artistInfo(track.artist, username),
        this.lastFMService.trackInfo(track.artist, track.name, username),
      ]);

      console.log(trackInfo.track.userloved === "1");

      nowPlayingEmbed = nowPlayingEmbed.setColor(
        trackInfo.track.userloved === "1" ? "#cc0000" : "black"
      ).setFooter(`${artistInfo.artist.stats.userplaycount} ${
        artistInfo.artist.name
      } scrobbles | ${trackInfo.track.userplaycount} scrobbles of this song
${artistInfo.artist.tags.tag.map((t) => t.name).join(" ‧ ")}`);
    }

    await message.channel.send(nowPlayingEmbed);
  }
}
