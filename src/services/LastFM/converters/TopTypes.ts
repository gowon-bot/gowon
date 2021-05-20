import {
  RawTopAlbum,
  RawTopAlbums,
  RawTopArtist,
  RawTopArtists,
  RawTopTrack,
  RawTopTracks,
} from "../LastFMService.types";
import {
  BaseConverter,
  Concatonatable,
  ImageCollection,
} from "./BaseConverter";

export class TopArtist extends BaseConverter {
  rank: number;
  mbid: string;
  url: string;
  userPlaycount: number;
  images: ImageCollection;
  name: string;
  streamable: boolean;

  constructor(topArtist: RawTopArtist) {
    super();

    this.rank = this.number(topArtist["@attr"].rank);
    this.mbid = topArtist.mbid;
    this.url = topArtist.url;
    this.userPlaycount = this.number(topArtist.playcount);
    this.images = new ImageCollection(topArtist.image);
    this.name = topArtist.name;
    this.streamable = this.boolean(topArtist.streamable);
  }
}

export class TopArtists
  extends BaseConverter
  implements Concatonatable<TopArtists>
{
  artists: TopArtist[];
  meta: {
    user: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(topArtists: RawTopArtists) {
    super();

    const attr = topArtists["@attr"];

    this.artists = topArtists.artist.map((a) => new TopArtist(a));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  concat(topArtists: TopArtists) {
    if (topArtists) {
      this.artists = this.artists.concat(topArtists.artists);
    }
  }
}

export class TopAlbum extends BaseConverter {
  artist: {
    url: string;
    name: string;
    mbid: string;
  };
  rank: number;
  images: ImageCollection;
  userPlaycount: number;
  url: string;
  name: string;
  mbid: string;

  constructor(topAlbum: RawTopAlbum) {
    super();

    this.rank = this.number(topAlbum["@attr"].rank);
    this.mbid = topAlbum.mbid;
    this.url = topAlbum.url;
    this.userPlaycount = this.number(topAlbum.playcount);
    this.images = new ImageCollection(topAlbum.image);
    this.name = topAlbum.name;

    this.artist = topAlbum.artist;
  }
}

export class TopAlbums
  extends BaseConverter
  implements Concatonatable<TopAlbums>
{
  albums: TopAlbum[];
  meta: {
    user: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(topAlbums: RawTopAlbums) {
    super();

    const attr = topAlbums["@attr"];

    this.albums = topAlbums.album.map((a) => new TopAlbum(a));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  concat(topAlbums: TopAlbums) {
    if (topAlbums) {
      this.albums = this.albums.concat(topAlbums.albums);
    }
  }
}

export class TopTrack extends BaseConverter {
  rank: number;
  artist: {
    url: string;
    name: string;
    mbid: string;
  };
  userPlaycount: number;
  duration: number;
  images: ImageCollection;
  url: string;
  name: string;
  mbid: string;

  constructor(topTrack: RawTopTrack) {
    super();

    this.rank = this.number(topTrack["@attr"].rank);
    this.mbid = topTrack.mbid;
    this.url = topTrack.url;
    this.userPlaycount = this.number(topTrack.playcount);
    this.images = new ImageCollection(topTrack.image);
    this.name = topTrack.name;
    this.duration = this.number(topTrack.duration);

    this.artist = topTrack.artist;
  }
}

export class TopTracks
  extends BaseConverter
  implements Concatonatable<TopTracks>
{
  tracks: TopTrack[];
  meta: {
    user: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(topTracks: RawTopTracks) {
    super();

    const attr = topTracks["@attr"];

    this.tracks = topTracks.track.map((t) => new TopTrack(t));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  concat(topTracks: TopTracks) {
    if (topTracks) {
      this.tracks = this.tracks.concat(topTracks.tracks);
    }
  }
}
