import { RedirectsService } from "../../services/dbservices/RedirectsService";
import {
  RecentTrack,
  RecentTracks,
} from "../../services/LastFM/converters/RecentTracks";
import { RedirectsCache } from "../caches/RedirectsCache";
import { isPaginator, Paginator } from "../Paginator";

export interface ComboDetails {
  plays: number;
  name: string;
  nowplaying: boolean;
  hitMax: boolean;
  shouldIncrement: boolean;
}

export class ComboCalculator {
  private combo = new Combo(this.redirectsService, this.additionalArtists);
  public totalTracks = 0;

  constructor(
    private redirectsService: RedirectsService,
    private additionalArtists: string[]
  ) {}

  async calculate(
    recentTracks: Paginator<any, RecentTracks> | RecentTracks
  ): Promise<Combo> {
    if (isPaginator(recentTracks)) {
      for await (let page of recentTracks.iterator()) {
        const shouldContinue = await this.handlePage(
          page,
          recentTracks.currentPage,
          recentTracks.maxPages
        );

        if (!shouldContinue) break;
      }
    } else {
      this.handlePage(recentTracks, 1, 1);
    }

    return this.combo;
  }

  private async handlePage(
    page: RecentTracks,
    pageNumber: number,
    maxPages: number
  ): Promise<boolean> {
    let tracks = this.extractTracks(page, pageNumber);

    this.totalTracks += tracks.filter((t) => !t.isNowPlaying).length;

    for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
      let track = tracks[trackIndex];

      if (!(await this.shouldContinue(track))) return false;

      await this.incrementCombo(
        track,
        pageNumber === maxPages && trackIndex === tracks.length - 1
      );
    }

    return true;
  }

  private extractTracks(page: RecentTracks, pageNumber: number): RecentTrack[] {
    let { tracks } = page;

    if (!tracks.length) return [];

    if (pageNumber === 1) this.combo.imprint(page.first());

    if (pageNumber === 1) {
      return tracks;
    } else {
      return tracks.filter((t) => !t.isNowPlaying);
    }
  }

  private async shouldContinue(track: RecentTrack): Promise<boolean> {
    return await this.combo.compareTrackToCombo(track);
  }

  private async incrementCombo(
    track: RecentTrack,
    last: boolean
  ): Promise<void> {
    await this.combo.increment(track, last);
  }
}

export class Combo {
  artist!: ComboDetails;
  album!: ComboDetails;
  track!: ComboDetails;

  private redirectsCache = new RedirectsCache(this.redirectsService);

  constructor(
    private redirectsService: RedirectsService,
    private artists: string[]
  ) {}

  hasAnyConsecutivePlays(): boolean {
    return (
      this.artist.plays > 1 || this.album.plays > 1 || this.track.plays > 1
    );
  }

  imprint(track: RecentTrack) {
    let nowplaying = !!track.isNowPlaying;

    let defaultDetails = {
      nowplaying,
      plays: 0,
      hitMax: false,
      shouldIncrement: true,
    } as Partial<ComboDetails>;

    this.artist = {
      ...defaultDetails,
      name: track.artist,
    } as ComboDetails;

    this.album = {
      ...defaultDetails,
      name: track.album,
    } as ComboDetails;

    this.track = {
      ...defaultDetails,
      name: track.name,
    } as ComboDetails;
  }

  get artistName(): string {
    return this.artist.name;
  }

  get albumName(): string {
    return this.album.name;
  }

  get trackName(): string {
    return this.track.name;
  }

  get artistNames(): string[] {
    return [
      this.artistName,
      ...this.artists.filter(
        (an) => !this.caseInsensitiveCompare(an, this.artistName)
      ),
    ];
  }

  async compareTrackToCombo(track: RecentTrack) {
    return (
      (await this.compareArtistNames(track.artist, this.artistNames)) ||
      this.caseInsensitiveCompare(track.album, this.albumName) ||
      this.caseInsensitiveCompare(track.name, this.trackName)
    );
  }

  async increment(track: RecentTrack, hitMax: boolean) {
    if (track.isNowPlaying) return;

    if (
      this.artist.shouldIncrement &&
      (await this.compareArtistNames(track.artist, this.artistNames))
    ) {
      this.artist.plays += 1;
      this.artist.hitMax = hitMax;
    } else this.artist.shouldIncrement = false;

    if (
      this.album.shouldIncrement &&
      this.caseInsensitiveCompare(track.album, this.albumName)
    ) {
      this.album.plays += 1;
      this.album.hitMax = hitMax;
    } else this.album.shouldIncrement = false;

    if (
      this.track.shouldIncrement &&
      this.caseInsensitiveCompare(track.name, this.trackName)
    ) {
      this.track.plays += 1;
      this.track.hitMax = hitMax;
    } else this.track.shouldIncrement = false;
  }

  private async compareArtistNames(
    artist: string,
    artists: string[]
  ): Promise<boolean> {
    for (let compareArtist of artists) {
      if (
        this.caseInsensitiveCompare(
          await this.redirectsCache.getRedirect(artist),
          await this.redirectsCache.getRedirect(compareArtist)
        )
      )
        return true;
    }

    return false;
  }

  private caseInsensitiveCompare(string1?: string, string2?: string) {
    if (!string1 || !string2) return false;

    return string1?.toLowerCase() === string2?.toLowerCase();
  }
}
