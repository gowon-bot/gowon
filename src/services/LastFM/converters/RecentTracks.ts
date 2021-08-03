import { fromUnixTime } from "date-fns";
import {
  MirrorballPageInfo,
  MirrorballPlay,
} from "../../mirrorball/MirrorballTypes";
import { RawRecentTracks, RawTrack } from "../LastFMService.types";
import {
  BaseConverter,
  Concatonatable,
  ImageCollection,
} from "./BaseConverter";

export class RecentTrack extends BaseConverter {
  artist: string;
  artistMBID: string;
  isNowPlaying: boolean;
  mbid: string;
  album: string;
  albumMBID: string;
  images: ImageCollection;
  streamable: boolean;
  url: string;
  name: string;
  scrobbledAt: Date;

  constructor(track: RawTrack) {
    super();

    this.artist = track.artist["#text"];
    this.artistMBID = track.artist.mbid;
    this.isNowPlaying = this.boolean(track["@attr"]?.nowplaying);
    this.mbid = track.mbid;
    this.album = track.album["#text"];
    this.albumMBID = track.album.mbid;
    this.images = new ImageCollection(track.image);
    this.streamable = this.boolean(track.streamable);
    this.url = track.url;
    this.name = track.name;
    this.scrobbledAt = track.date
      ? fromUnixTime(this.number(track.date.uts))
      : new Date();
  }
}

export class RecentTracks
  extends BaseConverter
  implements Concatonatable<RecentTracks>
{
  tracks: RecentTrack[];
  meta: {
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
    user: string;
  };

  constructor(recentTracks: RawRecentTracks) {
    super();

    const attr = recentTracks["@attr"];

    this.tracks = recentTracks.track.map((t) => new RecentTrack(t));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  static fromMirrorballPlaysResponse(
    response: {
      plays: { plays: MirrorballPlay[]; pageInfo: MirrorballPageInfo };
    },
    pageSize: number
  ): RecentTracks {
    return new RecentTracks({
      track: response.plays.plays.map((p) => {
        return {
          name: p.track.name,
          artist: {
            "#text": p.track.artist.name,
          },
          album: {
            "#text": p.track.album?.name,
          },
        } as RawTrack;
      }),
      "@attr": {
        page: "0",
        total: `${response.plays.pageInfo.recordCount}`,
        perPage: `${pageSize}`,
        totalPages: `${Math.ceil(
          response.plays.pageInfo.recordCount / pageSize
        )}`,
        user: "",
      },
    });
  }

  get isNowPlaying(): boolean {
    return this.tracks.slice(0, 5).some((t) => t.isNowPlaying);
  }

  get nowPlaying(): RecentTrack | undefined {
    return this.tracks.slice(0, 5).find((t) => t.isNowPlaying);
  }

  get withoutNowPlaying(): RecentTrack[] {
    return this.tracks.filter((t) => !t.isNowPlaying);
  }

  first(): RecentTrack {
    return this.tracks[0];
  }

  concat(tracks: RecentTracks) {
    if (tracks) {
      this.tracks = this.tracks.concat(tracks.tracks);
    }
  }
}
