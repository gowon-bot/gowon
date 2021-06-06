import { LinkGenerator } from "../../../helpers/lastFM";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import config from "../../../../config.json";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Message, MessageEmbed, User } from "discord.js";
import { CrownDisplay } from "../../../services/dbservices/CrownsService";
import { User as DBUser } from "../../../database/entity/User";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { sanitizeForDiscord } from "../../../helpers/discord";
import {
  AlbumInfo,
  ArtistInfo,
  TrackInfo,
} from "../../../services/LastFM/converters/InfoTypes";
import {
  RecentTrack,
  RecentTracks,
} from "../../../services/LastFM/converters/RecentTracks";
import { displayNumber } from "../../../lib/views/displays";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";

const args = {
  inputs: {
    otherWords: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export abstract class NowPlayingBaseCommand<
  T extends typeof args = typeof args
> extends LastFMBaseCommand<T> {
  subcategory = "nowplaying";
  usage = [
    "",
    "@user (will show their now playing)",
    "@user hey check out this song (will show your now playing)",
  ];

  arguments: Arguments = args;

  tagConsolidator = new TagConsolidator();

  protected async nowPlayingMentions(
    { noDiscordUser }: { noDiscordUser?: boolean } = { noDiscordUser: false }
  ): Promise<{
    requestable: Requestable;
    senderRequestable: Requestable;
    username: string;
    senderUsername: string;
    discordUser?: User;
  }> {
    let otherWords = this.parsedArguments.otherWords;

    let {
      username,
      senderUsername,
      discordUser,
      requestable,
      senderRequestable,
    } = await this.parseMentions(
      noDiscordUser
        ? {}
        : {
            fetchDiscordUser: true,
          }
    );

    if (
      otherWords &&
      !this.parsedArguments.userID &&
      !this.parsedArguments.lfmUser
    ) {
      requestable = senderRequestable;
      username = senderUsername;
    }

    return {
      username,
      senderUsername,
      discordUser,
      requestable,
      senderRequestable,
    };
  }

  protected scrobble(track: RecentTrack) {
    if (
      this.gowonClient.environment === "production" &&
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
  }

  protected nowPlayingEmbed(
    nowPlaying: RecentTrack,
    username: string
  ): MessageEmbed {
    let links = LinkGenerator.generateTrackLinksForEmbed(nowPlaying);

    return this.newEmbed()
      .setAuthor(
        `${
          nowPlaying.isNowPlaying ? "Now playing" : "Last scrobbled"
        } for ${username}`,
        this.author.avatarURL() || undefined,
        LinkGenerator.userPage(username)
      )
      .setDescription(
        `by ${links.artist.strong(false)}` +
          (nowPlaying.album ? ` from ${links.album.italic(false)}` : "")
      )
      .setTitle(sanitizeForDiscord(nowPlaying.name))
      .setURL(LinkGenerator.trackPage(nowPlaying.artist, nowPlaying.name))
      .setThumbnail(nowPlaying.images.get("large") || "");
  }

  protected artistPlays(
    artistInfo: { value?: ArtistInfo },
    track: RecentTrack,
    isCrownHolder: boolean
  ): string {
    return artistInfo.value
      ? (isCrownHolder ? "👑 " : "") +
          (track.artist.length < 150
            ? displayNumber(
                artistInfo.value.userPlaycount,
                `${track.artist} scrobble`
              )
            : displayNumber(artistInfo.value.userPlaycount, `scrobble`) +
              " of that artist")
      : "";
  }

  protected noArtistData(track: RecentTrack): string {
    return (
      "No data on last.fm for " +
      (track.artist.length > 150 ? "that artist" : track.artist)
    );
  }

  protected trackPlays(trackInfo: { value?: TrackInfo }): string {
    return trackInfo.value
      ? displayNumber(trackInfo.value.userPlaycount, "scrobble") +
          " of this song"
      : "";
  }

  protected albumPlays(albumInfo: { value?: AlbumInfo }): string {
    return albumInfo.value
      ? displayNumber(albumInfo.value?.userPlaycount, "scrobble") +
          " of this album"
      : "";
  }

  protected scrobbleCount(nowPlayingResponse: RecentTracks): string {
    return `${displayNumber(nowPlayingResponse.meta.total, "total scrobble")}`;
  }

  protected async crownDetails(
    crown: { value?: CrownDisplay },
    discordUser?: User
  ): Promise<{ isCrownHolder: boolean; crownString: string }> {
    let crownString = "";
    let isCrownHolder = false;

    if (crown.value && crown.value.user) {
      if (crown.value.user.id === discordUser?.id) {
        isCrownHolder = true;
      } else {
        if (await DBUser.stillInServer(this.message, crown.value.user.id)) {
          crownString = `👑 ${displayNumber(crown.value.crown.plays)} (${
            crown.value.user.username
          })`;
        }
      }
    }

    return { isCrownHolder, crownString };
  }

  protected async easterEggs(sentMessage: Message, track: RecentTrack) {
    if (
      track.artist.toLowerCase() === "twice" &&
      track.name.toLowerCase() === "jaljayo good night"
    ) {
      await sentMessage.react("😴");
    }

    if (
      this.tagConsolidator.hasTag("rare sad boy", "rsb", "rsg", "rare sad girl")
    ) {
      await sentMessage.react("😭");
    }
  }

  protected async customReactions(sentMessage: Message) {
    const reactions = JSON.parse(
      this.gowonService.settingsManager.get("reacts", {
        userID: this.author.id,
      }) || "[]"
    ) as string[];

    const badReactions = [] as string[];

    for (const reaction of reactions) {
      try {
        await sentMessage.react(reaction);
      } catch {
        badReactions.push(reaction);
      }
    }

    if (badReactions.length) {
      await this.gowonService.settingsManager.set(
        "reacts",
        { userID: this.author.id },
        JSON.stringify(reactions.filter((r) => !badReactions.includes(r)))
      );
    }
  }
}
