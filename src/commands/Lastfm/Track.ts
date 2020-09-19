import { MessageEmbed } from "discord.js";
import { numberDisplay } from "../../helpers";
import { sanitizeForDiscord } from "../../helpers/discord";
import { LinkGenerator } from "../../helpers/lastFM";
import { Arguments } from "../../lib/arguments/arguments";
import { TagConsolidator } from "../../lib/TagConsolidator";
import { CrownsService } from "../../services/dbservices/CrownsService";
import { Image } from "../../services/LastFM/LastFMService.types";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Track extends LastFMBaseCommand {
  description = "Searches and shows a track";
  usage = ["", "artist | track", "query string"];
  arguments: Arguments = {
    inputs: {
      querystring: { index: { start: 0 } },
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
  };

  tagConsolidator = new TagConsolidator();
  crownsService = new CrownsService(this.logger);

  async run() {
    let trackName = this.parsedArguments.track as string,
      artistName = this.parsedArguments.artist as string,
      querystring = this.parsedArguments.querystring as string;

    let { senderUsername: username } = await this.parseMentionedUsername();

    if (querystring.includes("|") || !querystring.trim()) {
      if (!artistName || !trackName) {
        let { senderUsername } = await this.parseMentionedUsername();

        let nowPlaying = await this.lastFMService.nowPlayingParsed(
          senderUsername
        );

        if (!artistName) artistName = nowPlaying.artist;
        if (!trackName) trackName = nowPlaying.name;
      }
    } else {
      let results = await this.lastFMService.trackSearch({
        track: querystring,
        limit: 1,
      });

      let track = results.results.trackmatches.track[0];

      trackName = track.name;
      artistName = track.artist;
    }

    let [artistInfo, trackInfo, crown] = (await Promise.allSettled([
      this.lastFMService.artistInfo({ artist: artistName, username }),
      this.lastFMService.trackInfo({
        artist: artistName,
        track: trackName,
        username,
      }),
      this.crownsService.getCrownDisplay(artistName, this.message),
    ])) as { status: string; value?: any; reason: any }[];

    let track = {
      name: (trackInfo.value?.name || trackName) as string,
      artist: (trackInfo.value?.artist?.name || artistName) as string,
      album: (trackInfo.value?.album?.name || "") as string,
    };

    let crownString = "";
    let isCrownHolder = false;

    if (crown.value && crown.value.user) {
      if (crown.value.user.id === this.message.author.id) {
        isCrownHolder = true;
      } else {
        crownString = `👑 ${numberDisplay(crown.value.crown.plays)} (${
          crown.value.user.username
        })`;
      }
    }

    if (trackInfo.value)
      this.tagConsolidator.addTags(trackInfo.value?.toptags?.tag || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);

    let nowPlayingEmbed = new MessageEmbed()
      .setAuthor(
        `Track for ${this.author.username}`,
        this.author.avatarURL() || undefined
      )
      .setTitle(sanitizeForDiscord(track.name))
      .setURL(LinkGenerator.trackPage(artistInfo.value.name, track.name))
      .setDescription(
        `by ${track.artist}` +
          (track.album ? ` from ${track.album.italic()}` : "")
      )
      .setThumbnail(
        trackInfo.value.image?.find((i: Image) => i.size === "large")?.[
          "#text"
        ] || ""
      )
      .setColor(trackInfo.value?.userloved === "1" ? "#cc0000" : "black")
      .setFooter(
        (isCrownHolder ? "👑 " : "") +
          (artistInfo.value && track.artist.length < 150
            ? numberDisplay(
                artistInfo.value.stats.userplaycount,
                `${track.artist} scrobble`
              )
            : "No data on last.fm for " +
              (track.artist.length > 150 ? "that artist" : track.artist)) +
          (artistInfo.value && trackInfo.value ? " | " : "\n") +
          (trackInfo.value
            ? numberDisplay(trackInfo.value.userplaycount, "scrobble") +
              " of this song\n"
            : "") +
          this.tagConsolidator.consolidate(Infinity, true).join(" ‧ ") +
          (crownString ? " • " + crownString : "")
      );

    let sentMessage = await this.send(nowPlayingEmbed);

    if (
      track.artist.toLowerCase() === "twice" &&
      track.name.toLowerCase() === "jaljayo good night"
    ) {
      sentMessage.react("😴");
    }
  }
}
