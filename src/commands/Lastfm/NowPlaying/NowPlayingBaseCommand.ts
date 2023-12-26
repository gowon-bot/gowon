import { User } from "discord.js";
import config from "../../../../config.json";
import { User as DBUser } from "../../../database/entity/User";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import {
  DatasourceService,
  DatasourceServiceContext,
} from "../../../lib/nowplaying/DatasourceService";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayNumber } from "../../../lib/ui/displays";
import { NowPlayingEmbed } from "../../../lib/ui/embeds/NowPlayingEmbed";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { RecentTrack } from "../../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import {
  GetMentionsOptions,
  Mentions,
} from "../../../services/arguments/mentions/MentionsService.types";
import { NowPlayingService } from "../../../services/dbservices/NowPlayingService";
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

  nowPlayingService = ServiceRegistry.get(NowPlayingService);
  settingsService = ServiceRegistry.get(SettingsService);
  albumCoverService = ServiceRegistry.get(AlbumCoverService);
  datasourceService = ServiceRegistry.get(DatasourceService);

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

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    const usernameDisplay = await this.nowPlayingService.getUsernameDisplay(
      this.ctx,
      dbUser,
      username
    );
    const presentedComponents =
      await this.nowPlayingService.getPresentedComponents(
        this.ctx,
        await Promise.resolve(this.getConfig(senderUser!)),
        recentTracks,
        requestable,
        dbUser
      );

    const tagConsolidator =
      this.ctx.getMutable<DatasourceServiceContext["mutable"]>()
        .tagConsolidator;

    const embed = this.authorEmbed()
      .transform(NowPlayingEmbed)
      .setDbUser(dbUser)
      .setNowPlaying(recentTracks.first(), tagConsolidator)
      .setUsername(username)
      .setUsernameDisplay(usernameDisplay)
      .setComponents(presentedComponents)
      .setCustomReacts(await this.getCustomReactions());

    await this.send(embed);
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

  protected scrobble(track: RecentTrack) {
    if (
      this.gowonClient.environment === "production" &&
      this.gowonClient.isAlphaTester(this.author.id)
    ) {
      this.lastFMService.scrobble(this.ctx, {
        artist: track.artist,
        track: track.name,
        album: track.album,
        timestamp: new Date().getTime() / 1000,
        username: {
          session: config.lastFMBotSessionKey,
        } as Requestable,
      });
    }
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

  protected async getCustomReactions() {
    return JSON.parse(
      this.settingsService.get("reacts", {
        userID: this.author.id,
      }) || "[]"
    ) as string[];
  }
}
