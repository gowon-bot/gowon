import { BaseCommand } from "../BaseCommand";
import { Message, MessageEmbed, User, Channel } from "discord.js";
import { LinkGenerator, parseLastFMTrackResponse } from "../helpers/lastFM";
import { numberDisplay } from "../helpers";
import { Arguments } from "../arguments";
import { isBotMoment, fakeNowPlaying } from "../botmoment/fakeNowPlaying";

export default class NowPlaying extends BaseCommand {
  aliases = ["np", "fm"];
  variations = [{
    variationString: "fmv",
    description: "Displays more information",
  }];
  description = "Displays the now playing or last played track in last.fm";
  arguments: Arguments = {
    inputs: {
      lastFMUsername: { index: 0, optional: true },
    },
    mentions: {
      0: { name: "user", description: "The user to lookup" },
    },
  };

  async run(message: Message, runAs?: string) {
    let user = this.parsedArguments.user as User,
      lastFMUsername = this.parsedArguments.lastFMUsername as string;

    if (isBotMoment(user?.id)) {
      await message.channel.send(fakeNowPlaying());
      return;
    }

    let username = lastFMUsername
      ? lastFMUsername
      : await this.usersService.getUsername(user?.id ?? message.author.id);

    let nowPlaying = await this.lastFMService.nowPlaying(username);

    let track = parseLastFMTrackResponse(nowPlaying);

    let links = LinkGenerator.generateTrackLinksForEmbed(nowPlaying);

    let nowPlayingEmbed = new MessageEmbed()
      .setColor("black")
      .setAuthor(
        `${
          nowPlaying["@attr"]?.nowplaying ? "Now playing" : "Last scrobbled"
        } for ${username}`
      )
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

      nowPlayingEmbed = nowPlayingEmbed
        .setColor(trackInfo.userloved === "1" ? "#cc0000" : "black")
        .setFooter(
          numberDisplay(
            artistInfo.stats.userplaycount,
            `${track.artist} scrobble`
          ) +
            " | " +
            numberDisplay(trackInfo.userplaycount, "scrobble") +
            " of this song\n" +
            artistInfo.tags.tag
              .map((t) => t.name.toLowerCase())
              .join(" ‧ ")
        );
    }

    await message.channel.send(nowPlayingEmbed);
  }
}
