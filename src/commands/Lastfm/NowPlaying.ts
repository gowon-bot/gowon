import { Message, MessageEmbed } from "discord.js";
import { LinkGenerator, parseLastFMTrackResponse } from "../../helpers/lastFM";
import { numberDisplay } from "../../helpers";
import { Arguments } from "../../lib/arguments/arguments";
import { isBotMoment, fakeNowPlaying } from "../../botmoment/fakeNowPlaying";
import { Mention } from "../../lib/arguments/mentions";
import { LastFMBaseCommand } from "./LastFMBaseCommand";
import { CrownsService } from "../../services/dbservices/CrownsService";
import { RunAs } from "../../lib/AliasChecker";

export default class NowPlaying extends LastFMBaseCommand {
  aliases = ["np", "fm"];
  variations = [
    {
      variationString: "fmv",
      description: "Displays more information",
    },
  ];
  description = "Displays the now playing or last played track in last.fm";
  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  crownsService = new CrownsService(this.logger);

  async run(message: Message, runAs: RunAs) {
    let user = this.parsedArguments.user as Mention;

    if (isBotMoment(typeof user !== "string" ? user?.id : "")) {
      await message.channel.send(fakeNowPlaying());
      return;
    }

    let username =
      typeof user === "string"
        ? user
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
        `by ${links.artist.bold()}` +
          (track.album ? ` from ${links.album.italic()}` : "")
      )
      .setThumbnail(
        nowPlaying.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    if (runAs.lastString()! === "fmv") {
      let [artistInfo, trackInfo, crown] = await Promise.all([
        this.lastFMService.artistInfo(track.artist, username),
        this.lastFMService.trackInfo(track.artist, track.name, username),
        this.crownsService.getCrownDisplay(track.artist, message),
      ]);

      let crownString = "";
      let isCrownHolder = false;

      if (crown && crown.user) {
        if (crown.user.id === message.author.id) {
          isCrownHolder = true;

          this.crownsService.checkCrown({
            artistName: nowPlaying.artist["#text"],
            serverID: message.guild?.id!,
            discordID: message.author.id,
            plays: artistInfo.stats.userplaycount.toInt(),
          });
        } else {
          crownString = `👑 ${numberDisplay(crown.crown.plays)} (${
            crown.user.username
          })`;
        }
      }

      nowPlayingEmbed = nowPlayingEmbed
        .setColor(trackInfo.userloved === "1" ? "#cc0000" : "black")
        .setFooter(
          (isCrownHolder ? "👑 " : "") +
            numberDisplay(
              artistInfo.stats.userplaycount,
              `${track.artist} scrobble`
            ) +
            " | " +
            numberDisplay(trackInfo.userplaycount, "scrobble") +
            " of this song\n" +
            artistInfo.tags.tag.map((t) => t.name.toLowerCase()).join(" ‧ ") +
            (crownString ? " • " + crownString : "")
        );
    }

    await message.channel.send(nowPlayingEmbed);
  }
}
