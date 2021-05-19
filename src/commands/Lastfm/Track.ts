import { LogicError } from "../../errors";
import { numberDisplay, promiseAllSettled } from "../../helpers";
import { sanitizeForDiscord } from "../../helpers/discord";
import { LinkGenerator } from "../../helpers/lastFM";
import { Arguments } from "../../lib/arguments/arguments";
import { TagConsolidator } from "../../lib/tags/TagConsolidator";
import { CrownsService } from "../../services/dbservices/CrownsService";
import { Image } from "../../services/LastFM/LastFMService.types";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  inputs: {
    querystring: { index: { start: 0 } },
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
} as const;

export default class Track extends LastFMBaseCommand<typeof args> {
  idSeed = "april jinsol";

  description = "Searches and displays a track";
  usage = ["", "artist | track", "query string"];
  arguments: Arguments = args;

  tagConsolidator = new TagConsolidator();
  crownsService = new CrownsService(this.logger);

  async run() {
    let trackName = this.parsedArguments.track,
      artistName = this.parsedArguments.artist,
      querystring = this.parsedArguments.querystring || "";

    let { senderUsername } = await this.parseMentions();

    if (querystring.includes("|") || !querystring.trim()) {
      if (!artistName || !trackName) {
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

      if (!track) throw new LogicError("that track could not be found!");

      trackName = track.name;
      artistName = track.artist;
    }

    let [artistInfo, trackInfo, crown] = await promiseAllSettled([
      this.lastFMConverter.artistInfo({
        artist: artistName,
        username: senderUsername,
      }),
      this.lastFMConverter.trackInfo({
        artist: artistName,
        track: trackName,
        username: senderUsername,
      }),
      this.crownsService.getCrownDisplay(artistName, this.guild),
    ]);

    if (!trackInfo.value)
      throw new LogicError("that track could not be found!");

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
      this.tagConsolidator.addTags(trackInfo.value?.tags || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(artistInfo.value?.tags || []);

    let nowPlayingEmbed = this.newEmbed()
      .setAuthor(
        `Track for ${this.author.username}`,
        this.author.avatarURL() || undefined
      )
      .setTitle(sanitizeForDiscord(track.name))
      .setURL(
        LinkGenerator.trackPage(
          artistInfo.value?.name || track.artist,
          track.name
        )
      )
      .setDescription(
        `by ${track.artist}` +
          (track.album ? ` from ${track.album.italic()}` : "")
      )
      .setThumbnail(trackInfo.value?.album?.images.get("large") || "")
      .setColor(trackInfo.value?.loved ? "#cc0000" : "black")
      .setFooter(
        (isCrownHolder ? "👑 " : "") +
          (artistInfo.value && track.artist.length < 150
            ? numberDisplay(
                artistInfo.value.userPlaycount,
                `${track.artist} scrobble`
              )
            : "No data on last.fm for " +
              (track.artist.length > 150 ? "that artist" : track.artist)) +
          (artistInfo.value && trackInfo.value ? " | " : "\n") +
          (trackInfo.value
            ? numberDisplay(trackInfo.value.userPlaycount, "scrobble") +
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

    if (
      this.tagConsolidator.hasTag("rare sad boy", "rsb", "rsg", "rare sad girl")
    ) {
      sentMessage.react("😭");
    }
  }
}
