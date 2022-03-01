import { In } from "typeorm";
import { SpotifyPlaylistTag } from "../../database/entity/SpotifyPlaylistTag";
import { User } from "../../database/entity/User";
import { EmojiMention } from "../../lib/context/arguments/parsers/EmojiParser";
import { GowonContext } from "../../lib/context/Context";
import { SettingsService } from "../../lib/settings/SettingsService";
import { displayNumber } from "../../lib/views/displays";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyPlaylist } from "./converters/Playlist";

export class SpotifyPlaylistTagService extends BaseService {
  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  async tagPlaylist(
    ctx: GowonContext,
    user: User,
    creationOptions: { playlistID: string; playlistName: string; emoji: string }
  ): Promise<SpotifyPlaylistTag> {
    this.log(
      ctx,
      `Tagging ${creationOptions.playlistID} as ${creationOptions.emoji} for user ${user.discordID}`
    );

    const existingTag = await SpotifyPlaylistTag.findOne({
      where: { user, playlistID: creationOptions.playlistID },
    });

    if (existingTag) {
      existingTag.emoji = creationOptions.emoji;
      existingTag.playlistName = creationOptions.playlistName;

      return await existingTag.save();
    } else {
      const newTag = SpotifyPlaylistTag.create({
        user,
        ...creationOptions,
      });

      return await newTag.save();
    }
  }

  async getPlaylistFromTag(
    ctx: GowonContext,
    user: User,
    tag?: EmojiMention
  ): Promise<SpotifyPlaylistTag | undefined> {
    if (!tag) return this.getDefaultPlaylist(ctx);

    this.log(
      ctx,
      `Fetching playlist tagged as ${tag.raw} for user ${user.discordID}`
    );

    return await SpotifyPlaylistTag.findOne({ user, emoji: tag.raw });
  }

  async getTagsForPlaylists(
    ctx: GowonContext,
    user: User,
    playlists: SpotifyPlaylist[]
  ) {
    this.log(
      ctx,
      `Fetching tags for ${displayNumber(
        playlists.length,
        "playlist"
      )} for user ${user.discordID}`
    );

    const ids = playlists.map((p) => p.id);

    const tags = await SpotifyPlaylistTag.find({ playlistID: In(ids), user });

    for (const tag of tags) {
      const playlist = playlists.find((p) => p.id === tag.playlistID)!;

      playlist.tag = tag;
    }
  }

  async setPlaylistAsDefault(
    ctx: GowonContext,
    playlist: SpotifyPlaylist
  ): Promise<void> {
    const stringifiedPlaylist = JSON.stringify({
      playlistID: playlist.id,
      playlistName: playlist.name,
      emoji: "",
    });

    await this.settingsService.set(
      ctx,
      "defaultSpotifyPlaylist",
      {
        userID: ctx.command.payload.author.id,
      },
      stringifiedPlaylist
    );
  }

  getDefaultPlaylist(ctx: GowonContext): SpotifyPlaylistTag | undefined {
    this.log(
      ctx,
      `Fetching default Spotify playlist for user ${ctx.command.payload.author.id}`
    );

    const response = this.settingsService.get("defaultSpotifyPlaylist", {
      userID: ctx.command.payload.author.id,
    });

    if (!response) return undefined;

    // If it's not typed as an object, typeorm will think it's an array
    return SpotifyPlaylistTag.create(JSON.parse(response) as {});
  }
}
