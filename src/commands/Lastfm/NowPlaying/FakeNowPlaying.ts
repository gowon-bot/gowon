import { User as DBUser } from "../../../database/entity/User";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { NowPlayingEmbed } from "../../../lib/ui/embeds/NowPlayingEmbed";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { LastFMArgumentsMutableContext } from "../../../services/LastFM/LastFMArguments";
import { TrackInfo } from "../../../services/LastFM/converters/InfoTypes";
import {
  RecentTrack,
  RecentTracks,
} from "../../../services/LastFM/converters/RecentTracks";
import { NowPlayingBaseCommand, nowPlayingArgs } from "./NowPlayingBaseCommand";

const args = {
  ...prefabArguments.track,
  ...nowPlayingArgs,
};

export default class FakeNowPlaying extends NowPlayingBaseCommand<typeof args> {
  idSeed = "april jinsol";

  aliases = ["track", "fnp", "ffm"];

  arguments = args;

  description =
    "Displays any given track as if it were your currently playing song";
  usage = ["search term", "artist | track"];

  slashCommand = true;

  async getConfig(senderUser: DBUser): Promise<string[]> {
    return await this.nowPlayingService.getConfigForUser(this.ctx, senderUser);
  }

  async run() {
    const { dbUser, senderUser, senderRequestable, requestable, username } =
      await this.getMentions({
        senderRequired: true,
      });

    const recentTracks = await this.getRecentTracks(senderRequestable);

    const components = await this.nowPlayingService.renderComponents(
      this.ctx,
      await this.getConfig(senderUser!),
      recentTracks,
      requestable,
      dbUser
    );

    const usernameDisplay = await this.nowPlayingService.getUsernameDisplay(
      this.ctx,
      dbUser,
      username
    );

    const albumCover = await this.getAlbumCover(recentTracks.first());

    const embed = this.minimalEmbed()
      .transform(NowPlayingEmbed)
      .setDbUser(dbUser)
      .setNowPlaying(recentTracks.first(), this.tagConsolidator)
      .setAlbumCover(albumCover)
      .setUsername(username)
      .setUsernameDisplay(usernameDisplay)
      .setComponents(components)
      .setCustomReacts(await this.getCustomReactions());

    await this.reply(embed);
  }

  private async getRecentTracks(
    senderRequestable: Requestable
  ): Promise<RecentTracks> {
    const recentTracks = await this.lastFMService.recentTracks(this.ctx, {
      username: senderRequestable,
      limit: 1,
    });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable,
      { fromRecentTrack: recentTracks.first() }
    );

    const mutableContext = this.ctx.getMutable<LastFMArgumentsMutableContext>();

    // if lastFMArguments used the recent track
    if (mutableContext.nowplaying || mutableContext.parsedNowplaying) {
      return recentTracks;
    } else {
      const trackInfo = await this.lastFMService.trackInfo(this.ctx, {
        artist,
        track,
      });

      recentTracks.tracks[0] = this.recentTrackFromTrackInfo(trackInfo);

      return recentTracks;
    }
  }

  private recentTrackFromTrackInfo(track: TrackInfo): RecentTrack {
    return new RecentTrack({
      artist: { mbid: "", "#text": track.artist.name },
      "@attr": { nowplaying: "1" },
      mbid: "",
      album: { mbid: "", "#text": track.album?.name || "" },
      image: track.album
        ? [{ size: "large", "#text": track.album?.images.get("large")! }]
        : [],
      streamable: "1",
      url: "",
      name: track.name,
      date: {
        uts: `${new Date().getTime()}`,
        "#text": "",
      },
    });
  }
}
