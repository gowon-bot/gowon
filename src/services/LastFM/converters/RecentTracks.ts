import { fromUnixTime } from "date-fns";
import { RecentTracks, Track } from "../LastFMService.types";
import {
  BaseConverter,
  Concatonatable,
  ImageCollection,
} from "./BaseConverter";

export class ConvertedRecentTrack extends BaseConverter {
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

  constructor(track: Track) {
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

export class ConvertedRecentTracks
  extends BaseConverter
  implements Concatonatable<ConvertedRecentTracks>
{
  tracks: ConvertedRecentTrack[];
  meta: {
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
    user: string;
  };

  constructor(recentTracks: RecentTracks) {
    super();

    const attr = recentTracks["@attr"];

    this.tracks = recentTracks.track.map((t) => new ConvertedRecentTrack(t));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  first(): ConvertedRecentTrack {
    return this.tracks[0];
  }

  concat(tracks: ConvertedRecentTracks) {
    if (tracks) {
      this.tracks = this.tracks.concat(tracks.tracks);
    }
  }
}
