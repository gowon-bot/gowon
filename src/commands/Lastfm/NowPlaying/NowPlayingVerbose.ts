import { Message } from "discord.js";
import {
  LinkGenerator,
  parseLastFMTrackResponse,
} from "../../../helpers/lastFM";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { TagConsolidator } from "../../../lib/TagConsolidator";
import { sanitizeForDiscord } from "../../../helpers/discord";
import config from "../../../../config.json";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { User } from "../../../database/entity/User";

export default class NowPlayingVerbose extends LastFMBaseCommand {
  aliases = ["npv", "fmv", "fmt"];
  description = "Displays the now playing or last played track in last.fm";
  subcategory = "nowplaying";
  usage = [
    "",
    "@user (will show their now playing)",
    "@user hey check out this song (will show your now playing)",
  ];
  arguments: Arguments = {
    inputs: {
      otherWords: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  crownsService = new CrownsService(this.logger);
  tagConsolidator = new TagConsolidator();

  async run(message: Message) {
    let otherWords = this.parsedArguments.otherWords as string | undefined;

    let { username, senderUsername } = await this.parseMentions();

    if (
      otherWords &&
      !this.parsedArguments.userID &&
      !this.parsedArguments.lfmUser
    ) {
      username = senderUsername;
    }

    let nowPlaying = await this.lastFMService.nowPlaying(username);

    let track = parseLastFMTrackResponse(nowPlaying);

    let links = LinkGenerator.generateTrackLinksForEmbed(nowPlaying);

    if (
      nowPlaying["@attr"]?.nowplaying &&
      this.gowonClient.isAlphaTester(this.author.id)
    ) {
      this.lastFMService.scrobbleTrack(
        {
          artist: track.artist,
          track: track.name,
          album: track.album,
          timestamp: new Date().getTime() / 1000,
        },
        config.lastFMBotSessionKey
      );
    }

    // Types for Promise.allSettled are broken(?), so I have to manually assert the type that's returned
    let [artistInfo, trackInfo, crown] = (await Promise.allSettled([
      this.lastFMService.artistInfo({ artist: track.artist, username }),
      this.lastFMService.trackInfo({
        artist: track.artist,
        track: track.name,
        username,
      }),
      this.crownsService.getCrownDisplay(track.artist, this.guild),
    ])) as { status: string; value?: any; reason: any }[];

    let crownString = "";
    let isCrownHolder = false;

    if (crown.value && crown.value.user) {
      if (crown.value.user.id === message.author.id) {
        isCrownHolder = true;
      } else {
        if (await User.stillInServer(this.message, crown.value.user.id)) {
          crownString = `👑 ${numberDisplay(crown.value.crown.plays)} (${
            crown.value.user.username
          })`;
        }
      }
    }

    this.tagConsolidator.addArtistName(track.artist);

    if (trackInfo.value)
      this.tagConsolidator.addTags(trackInfo.value?.toptags?.tag || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);

    let artistPlays = artistInfo.value
      ? (isCrownHolder ? "👑 " : "") +
        (track.artist.length < 150
          ? numberDisplay(
              artistInfo.value.stats.userplaycount,
              `${track.artist} scrobble`
            )
          : numberDisplay(artistInfo.value.stats.userplaycount, `scrobble`) +
            " of that artist")
      : "";

    let noArtistData =
      "No data on last.fm for " +
      (track.artist.length > 150 ? "that artist" : nowPlaying.artist["#text"]);

    let trackPlays = trackInfo.value
      ? numberDisplay(trackInfo.value.userplaycount, "scrobble") +
        " of this song"
      : "";

    let tags = this.tagConsolidator.consolidate(Infinity).join(" ‧ ");

    let lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      // Top line
      {
        shouldDisplay: !!artistPlays && !!trackPlays && !!crownString,
        string: `${artistPlays} • ${trackPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistPlays && !!trackPlays && !crownString,
        string: `${artistPlays} • ${trackPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !trackPlays && !!crownString,
        string: `${artistPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!trackPlays && !!crownString,
        string: `${noArtistData} • ${trackPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !trackPlays && !!crownString,
        string: `${noArtistData} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!trackPlays && !crownString,
        string: `${noArtistData} • ${trackPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !trackPlays && !crownString,
        string: `${artistPlays}`,
      },
      {
        shouldDisplay: !artistPlays && !trackPlays && !crownString,
        string: `${noArtistData}`,
      },
      // Second line
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: tags,
      }
    );

    let nowPlayingEmbed = this.newEmbed()
      .setAuthor(
        `${
          nowPlaying["@attr"]?.nowplaying ? "Now playing" : "Last scrobbled"
        } for ${username}`,
        message.author.avatarURL() || undefined,
        LinkGenerator.userPage(username)
      )
      .setTitle(sanitizeForDiscord(track.name))
      .setURL(LinkGenerator.trackPage(track.artist, track.name))
      .setDescription(
        `by ${links.artist.bold()}` +
          (track.album ? ` from ${links.album.italic()}` : "")
      )
      .setThumbnail(
        nowPlaying.image.find((i) => i.size === "large")?.["#text"] || ""
      )
      .setFooter(lineConsolidator.consolidate());

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
