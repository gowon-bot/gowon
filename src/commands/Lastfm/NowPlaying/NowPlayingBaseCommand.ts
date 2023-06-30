import { EmbedBuilder, Message, User } from "discord.js";
import config from "../../../../config.json";
import { bold, italic, sanitizeForDiscord } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayNumber } from "../../../lib/views/displays";
import {
  AlbumInfo,
  ArtistInfo,
  TrackInfo,
} from "../../../services/LastFM/converters/InfoTypes";
import {
  RecentTrack,
  RecentTracks,
} from "../../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import {
  GetMentionsOptions,
  Mentions,
} from "../../../services/arguments/mentions/MentionsService.types";
import { CrownDisplay } from "../../../services/dbservices/crowns/CrownsService.types";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export const nowPlayingArgs = {
  ...standardMentions,
  otherWords: new StringArgument({
    index: { start: 0 },
    slashCommandOption: false,
  }),
} satisfies ArgumentsMap;

export abstract class NowPlayingBaseCommand<
  T extends typeof nowPlayingArgs = typeof nowPlayingArgs
> extends LastFMBaseCommand<T> {
  subcategory = "nowplaying";
  usage = [
    "",
    "@user (will show their now playing)",
    "@user hey check out this song (will show your now playing)",
  ];

  arguments = nowPlayingArgs as T;

  settingsService = ServiceRegistry.get(SettingsService);
  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  tagConsolidator = new TagConsolidator();

  async getMentions(options?: Partial<GetMentionsOptions>): Promise<Mentions> {
    const otherWords = this.parsedArguments.otherWords;

    const mentions = await super.getMentions({
      senderRequired: this.parsedArguments.otherWords ? false : true,
      fetchDiscordUser: true,
      ...(options || {}),
    });

    if (otherWords && this.parsedArguments.user) {
      mentions.requestable = mentions.senderRequestable;
      mentions.username = mentions.senderUsername;
      mentions.dbUser = mentions.senderUser!;
      mentions.lilacUser = mentions.senderLilacUser;
    }

    return mentions;
  }

  protected scrobble(track: RecentTrack) {
    if (
      this.gowonClient.environment === "production" &&
      this.gowonClient.isAlphaTester(this.author.id)
    ) {
      this.lastFMService.scrobbleTrack(
        this.ctx,
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

  protected async nowPlayingEmbed(
    nowPlaying: RecentTrack,
    username: string
  ): Promise<EmbedBuilder> {
    const links = LastfmLinks.generateTrackLinksForEmbed(nowPlaying);

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      nowPlaying.images.get("large"),
      {
        metadata: {
          artist: nowPlaying.artist,
          album: nowPlaying.album,
        },
      }
    );

    return this.newEmbed()
      .setAuthor({
        name: `${
          nowPlaying.isNowPlaying ? "Now playing" : "Last scrobbled"
        } for ${username}`,
        iconURL:
          this.payload.member?.avatarURL() ||
          this.payload.author.avatarURL() ||
          undefined,
        url: LastfmLinks.userPage(username),
      })
      .setDescription(
        `by ${bold(links.artist, false)}` +
          (nowPlaying.album ? ` from ${italic(links.album, false)}` : "")
      )
      .setTitle(sanitizeForDiscord(nowPlaying.name))
      .setURL(LastfmLinks.trackPage(nowPlaying.artist, nowPlaying.name))
      .setThumbnail(albumCover || this.albumCoverService.defaultCover);
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
        if (
          await this.discordService.userInServer(this.ctx, crown.value.user.id)
        ) {
          crownString = `👑 ${displayNumber(crown.value.crown.plays)} (${
            crown.value.user.username
          })`;
        }
      }
    }

    return { isCrownHolder, crownString };
  }

  protected async easterEggs(
    sentMessage: Message,
    track: RecentTrack,
    tagConsolidator?: TagConsolidator
  ) {
    const consolidator = tagConsolidator || this.tagConsolidator;

    if (
      track.artist.toLowerCase() === "twice" &&
      track.name.toLowerCase() === "jaljayo good night"
    ) {
      await sentMessage.react("😴");
    }

    if (consolidator.hasTag("rare sad boy", "rsb", "rsg", "rare sad girl")) {
      await sentMessage.react("😭");
    }
  }

  protected async customReactions(sentMessage: Message) {
    const reactions = JSON.parse(
      this.settingsService.get("reacts", {
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
      await this.settingsService.set(
        this.ctx,
        "reacts",
        { userID: this.author.id },
        JSON.stringify(reactions.filter((r) => !badReactions.includes(r)))
      );
    }
  }
}
