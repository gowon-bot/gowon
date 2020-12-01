import { parseLastFMTrackResponse } from "../../../helpers/lastFM";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingAlbum extends NowPlayingBaseCommand {
  aliases = ["fml", "npl", "fma"];
  description =
    "Displays the now playing or last played track from Last.fm, including some album information";

  crownsService = new CrownsService(this.logger);

  async run() {
    let { username, discordUser } = await this.nowPlayingMentions();

    let nowPlaying = await this.lastFMService.nowPlaying(username);

    let track = parseLastFMTrackResponse(nowPlaying);

    if (nowPlaying["@attr"]?.nowplaying) this.scrobble(track);

    this.tagConsolidator.addArtistName(track.artist);

    // Types for Promise.allSettled are broken(?), so I have to manually assert the type that's returned
    let [artistInfo, albumInfo, crown] = (await Promise.allSettled([
      this.lastFMService.artistInfo({ artist: track.artist, username }),
      this.lastFMService.albumInfo({
        artist: track.artist,
        album: track.album,
        username,
      }),
      this.crownsService.getCrownDisplay(track.artist, this.guild),
    ])) as { status: string; value?: any; reason: any }[];

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    if (albumInfo.value)
      this.tagConsolidator.addTags(albumInfo.value?.tags?.tag || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);

    let artistPlays = this.artistPlays(artistInfo, track, isCrownHolder);
    let noArtistData = this.noArtistData(nowPlaying);
    let albumPlays = this.albumPlays(albumInfo);
    let tags = this.tagConsolidator.consolidate(Infinity).join(" ‧ ");

    let lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      // Top line
      {
        shouldDisplay: !!artistPlays && !!albumPlays && !!crownString,
        string: `${artistPlays} • ${albumPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistPlays && !!albumPlays && !crownString,
        string: `${artistPlays} • ${albumPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !albumPlays && !!crownString,
        string: `${artistPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!albumPlays && !!crownString,
        string: `${noArtistData} • ${albumPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !albumPlays && !!crownString,
        string: `${noArtistData} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!albumPlays && !crownString,
        string: `${noArtistData} • ${albumPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !albumPlays && !crownString,
        string: `${artistPlays}`,
      },
      {
        shouldDisplay: !artistPlays && !albumPlays && !crownString,
        string: `${noArtistData}`,
      },
      // Second line
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: tags,
      }
    );

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username).setFooter(
      lineConsolidator.consolidate()
    );

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.easterEggs(sentMessage, track);
  }
}
