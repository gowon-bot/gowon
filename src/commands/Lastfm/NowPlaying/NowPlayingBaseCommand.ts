import { User as DBUser } from "../../../database/entity/User";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { DatasourceServiceContext } from "../../../lib/nowplaying/DatasourceService";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { Image } from "../../../lib/ui/Image";
import { NowPlayingEmbed } from "../../../lib/ui/embeds/NowPlayingEmbed";
import { fmz, reverseNowPlayingEmbed } from "../../../lib/ui/embeds/mutators";
import { RecentTrack } from "../../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import {
  GetMentionsOptions,
  Mentions,
} from "../../../services/arguments/mentions/MentionsService.types";
import { NowPlayingService } from "../../../services/dbservices/NowPlayingService";
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

  nowPlayingService = ServiceRegistry.get(NowPlayingService);
  settingsService = ServiceRegistry.get(SettingsService);
  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  tagConsolidator = new TagConsolidator();

  abstract getConfig(senderUser: DBUser): string[] | Promise<string[]>;

  async run() {
    const { username, requestable, dbUser, senderUser } =
      await this.getMentions();

    const recentTracks = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable,
      limit: 1,
    });

    const nowPlaying = recentTracks.first();

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    const usernameDisplay = await this.nowPlayingService.getUsernameDisplay(
      this.ctx,
      dbUser,
      username
    );

    const renderedComponents = await this.nowPlayingService.renderComponents(
      this.ctx,
      await Promise.resolve(this.getConfig(senderUser!)),
      recentTracks,
      requestable,
      dbUser
    );

    const tagConsolidator =
      this.ctx.getMutable<DatasourceServiceContext["mutable"]>()
        .tagConsolidator;

    const albumCover = await this.getAlbumCover(recentTracks.first());

    const embed = this.minimalEmbed()
      .transform(NowPlayingEmbed)
      .setDbUser(dbUser)
      .setNowPlaying(recentTracks.first(), tagConsolidator)
      .setAlbumCover(albumCover)
      .setUsername(username)
      .setUsernameDisplay(usernameDisplay)
      .setComponents(renderedComponents)
      .setCustomReacts(await this.getCustomReactions())
      .asDiscordSendable()
      .mutateIf(this.extract.didMatch("mf"), reverseNowPlayingEmbed)
      .mutateIf(this.variationWasUsed("badTyping"), fmz);

    await this.reply(embed);
  }

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

  protected async getCustomReactions() {
    return JSON.parse(
      this.settingsService.get("reacts", {
        userID: this.author.id,
      }) || "[]"
    ) as string[];
  }

  protected async getAlbumCover(
    nowPlaying: RecentTrack
  ): Promise<Image | undefined> {
    const url = await this.albumCoverService.get(
      this.ctx,
      nowPlaying.images.get("large"),
      {
        metadata: {
          artist: nowPlaying.artist,
          album: nowPlaying.album,
        },
      }
    );

    return url ? Image.fromURL(url) : undefined;
  }
}
