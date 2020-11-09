import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { RecentTracks, Track } from "../../services/LastFM/LastFMService.types";
import { RedirectsCache } from "../caches/RedirectsCache";
import { Paginator } from "../Paginator";

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

  async calculate(paginator: Paginator<any, RecentTracks>): Promise<Combo> {
    for await (let page of paginator.iterator()) {
      let tracks = this.extractTracks(page, paginator.currentPage);

      this.totalTracks +=
        paginator.currentPage === 1 ? tracks.length - 1 : tracks.length;

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        let track = tracks[trackIndex];

        if (!(await this.shouldContinue(track))) return this.combo;

        await this.incrementCombo(
          track,
          paginator.currentPage === paginator.maxPages &&
            trackIndex === tracks.length - 1
        );
      }
    }

    return this.combo;
  }

  private extractTracks(page: RecentTracks, pageNumber: number): Track[] {
    let tracks = page.track;

    if (!tracks.length) return [];

    if (pageNumber === 1) this.combo.imprint(tracks[0]);

    if (pageNumber === 1 && tracks[0]["@attr"]?.nowplaying) {
      return tracks;
    } else {
      return tracks.slice(1);
    }
  }

  private async shouldContinue(track: Track): Promise<boolean> {
    return await this.combo.compareTrackToCombo(track);
  }

  private async incrementCombo(track: Track, last: boolean): Promise<void> {
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
    let limit = this.track.nowplaying ? 0 : 1;

    return (
      this.artist.plays > limit ||
      this.album.plays > limit ||
      this.track.plays > limit
    );
  }

  imprint(track: Track) {
    let nowplaying = !!track["@attr"]?.nowplaying;

    let defaultDetails = {
      nowplaying,
      plays: 0,
      hitMax: false,
      shouldIncrement: true,
    } as Partial<ComboDetails>;

    this.artist = {
      ...defaultDetails,
      name: track.artist["#text"],
    } as ComboDetails;

    this.album = {
      ...defaultDetails,
      name: track.album["#text"],
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

  async compareTrackToCombo(track: Track) {
    return (
      (await this.compareArtistNames(
        track.artist["#text"],
        this.artistNames
      )) ||
      this.caseInsensitiveCompare(track.album["#text"], this.albumName) ||
      this.caseInsensitiveCompare(track.name, this.trackName)
    );
  }

  async increment(track: Track, hitMax: boolean) {
    if (track["@attr"]?.nowplaying) return;

    if (
      this.artist.shouldIncrement &&
      (await this.compareArtistNames(track.artist["#text"], this.artistNames))
    ) {
      this.artist.plays += 1;
      this.artist.hitMax = hitMax;
    } else this.artist.shouldIncrement = false;

    if (
      this.album.shouldIncrement &&
      this.caseInsensitiveCompare(track.album["#text"], this.albumName)
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
