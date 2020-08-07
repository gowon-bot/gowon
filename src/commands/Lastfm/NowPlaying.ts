import { Message, MessageEmbed } from "discord.js";
import { LinkGenerator, parseLastFMTrackResponse } from "../../helpers/lastFM";
import { numberDisplay } from "../../helpers";
import { Arguments } from "../../lib/arguments/arguments";
import { isBotMoment, fakeNowPlaying } from "../../botmoment/fakeNowPlaying";
import { Mention } from "../../lib/arguments/mentions";
import { LastFMBaseCommand } from "./LastFMBaseCommand";
import {
  CrownsService,
  CrownCheck,
} from "../../services/dbservices/CrownsService";
import { RunAs } from "../../lib/AliasChecker";
import { ArtistInfo } from "../../services/LastFMService.types";
import { TagConsolidator } from "../../lib/TagConsolidator";

export default class NowPlaying extends LastFMBaseCommand {
  aliases = ["np", "fm"];
  variations = [
    {
      variationString: "fmvv",
      description: "Displays a bit more information",
    },
    {
      variationString: "fmc",
      description: "Displays a bit less information",
    },
  ];
  description = "Displays the now playing or last played track in last.fm";
  arguments: Arguments = {
    inputs: {
      otherWords: { index: { start: 0 } },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  crownsService = new CrownsService(this.logger);
  tagConsolidator = new TagConsolidator();

  async run(message: Message, runAs: RunAs) {
    let user = this.parsedArguments.user as Mention,
      otherWords = this.parsedArguments.otherWords as string | undefined;

    if (isBotMoment(typeof user !== "string" ? user?.id : "")) {
      await message.channel.send(fakeNowPlaying());
      return;
    }

    let username =
      typeof user === "string"
        ? user
        : await this.usersService.getUsername(
            (!otherWords && user?.id) || message.author.id,
            message.guild?.id!
          );

    let nowPlaying = await this.lastFMService.nowPlaying(username);

    let track = parseLastFMTrackResponse(nowPlaying);

    let links = LinkGenerator.generateTrackLinksForEmbed(nowPlaying);

    let nowPlayingEmbed = new MessageEmbed()
      .setColor("black")
      .setAuthor(
        `${
          nowPlaying["@attr"]?.nowplaying ? "Now playing" : "Last scrobbled"
        } for ${username}`,
        message.author.avatarURL() || undefined
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

    if (!["fmc"].includes(runAs.lastString()!)) {
      // Types for Promise.allSettled are broken(?), so I have to manually assert the type that's returned
      let [artistInfo, trackInfo, crown] = (await Promise.allSettled([
        this.lastFMService.artistInfo(track.artist, username),
        this.lastFMService.trackInfo(track.artist, track.name, username),
        this.crownsService.getCrownDisplay(track.artist, message),
      ])) as { status: string; value?: any; reason: any }[];

      let crownString = "";
      let isCrownHolder = false;

      if (crown.value && crown.value.user) {
        if (crown.value.user.id === message.author.id) {
          isCrownHolder = true;

          if (artistInfo.value) {
            (crown.value! as CrownCheck).crown!.plays = (artistInfo.value as ArtistInfo).stats.userplaycount.toInt();
            crown.value.crown.save();
          }
        } else {
          crownString = `👑 ${numberDisplay(crown.value.crown.plays)} (${
            crown.value.user.username
          })`;
        }
      }

      if (runAs.lastString() === "fmvv") {
        if (trackInfo.value)
          this.tagConsolidator.addTags(trackInfo.value?.toptags?.tag || []);
        if (artistInfo.value)
          this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);
      } else {
        if (artistInfo.value)
          this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);
        if (trackInfo.value)
          this.tagConsolidator.addTags(trackInfo.value?.toptags?.tag || []);
      }

      nowPlayingEmbed = nowPlayingEmbed
        .setColor(trackInfo.value?.userloved === "1" ? "#cc0000" : "black")
        .setFooter(
          (isCrownHolder ? "👑 " : "") +
            (artistInfo.value
              ? numberDisplay(
                  artistInfo.value.stats.userplaycount,
                  `${track.artist} scrobble`
                )
              : "No data on last.fm for " + nowPlaying.artist["#text"]) +
            (artistInfo.value && trackInfo.value ? " | " : "\n") +
            (trackInfo.value
              ? numberDisplay(trackInfo.value.userplaycount, "scrobble") +
                " of this song\n"
              : "") +
            this.tagConsolidator
              .consolidate(
                runAs.lastString() === "fmvv" ? Infinity : 6,
                runAs.lastString() !== "fmvv"
              )
              .join(" ‧ ") +
            (crownString ? " • " + crownString : "")
        );
    }

    await message.channel.send(nowPlayingEmbed);
  }
}
