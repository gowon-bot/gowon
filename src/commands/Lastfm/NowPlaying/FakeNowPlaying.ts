import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { DatasourceService } from "../../../lib/nowplaying/DatasourceService";
import { NowPlayingBuilder } from "../../../lib/nowplaying/NowPlayingBuilder";
import { RequirementMap } from "../../../lib/nowplaying/RequirementMap";
import { ConfigService } from "../../../services/dbservices/NowPlayingService";
import { TrackInfo } from "../../../services/LastFM/converters/InfoTypes";
import {
  RecentTrack,
  RecentTracks,
} from "../../../services/LastFM/converters/RecentTracks";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { LastFMArgumentsMutableContext } from "../../../services/LastFM/LastFMArguments";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { nowPlayingArgs, NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

const args = {
  ...prefabArguments.track,
  ...nowPlayingArgs,
};

export default class FakeNowPlaying extends NowPlayingBaseCommand<typeof args> {
  idSeed = "april jinsol";

  aliases = ["track"];

  arguments = args;

  description =
    "Displays any given track as if it were your currently playing song";
  usage = ["search term", "artist | track"];

  slashCommand = true;

  datasourceService = ServiceRegistry.get(DatasourceService);
  configService = ServiceRegistry.get(ConfigService);

  async run() {
    const { dbUser, senderUser, senderRequestable, requestable, username } =
      await this.getMentions({
        senderRequired: true,
      });

    const recentTracks = await this.getRecentTracks(senderRequestable);

    const config = await this.configService.getConfigForUser(
      this.ctx,
      senderUser!
    );

    const builder = new NowPlayingBuilder(config);

    const requirements =
      builder.generateRequirements() as (keyof RequirementMap)[];

    const resolvedRequirements =
      await this.datasourceService.resolveRequirements(this.ctx, requirements, {
        recentTracks,
        requestable,
        username,
        dbUser,
        payload: this.payload,
        components: config,
        prefix: this.prefix,
      });

    const baseEmbed = (
      await this.nowPlayingEmbed(recentTracks.first(), username)
    ).setAuthor({
      name: `Track for ${username}`,
      iconURL:
        this.payload.member.avatarURL() ||
        this.payload.author.avatarURL() ||
        undefined,
      url: LastfmLinks.userPage(username),
    });

    const embed = await builder.asEmbed(resolvedRequirements, baseEmbed);

    const sentMessage = await this.send(embed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, recentTracks.first());
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

    const mutableContext =
      this.mutableContext<LastFMArgumentsMutableContext>().mutable;

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
