import {
  TopAlbum,
  TopAlbums,
  TopArtist,
  TopArtists,
  TopTrack,
  TopTracks,
} from "../LastFMService.types";
import {
  BaseConverter,
  Concatonatable,
  ImageCollection,
} from "./BaseConverter";

export class ConvertedTopArtist extends BaseConverter {
  rank: number;
  mbid: string;
  url: string;
  userPlaycount: number;
  images: ImageCollection;
  name: string;
  streamable: boolean;

  constructor(topArtist: TopArtist) {
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

export class ConvertedTopArtists
  extends BaseConverter
  implements Concatonatable<ConvertedTopArtists>
{
  artists: ConvertedTopArtist[];
  meta: {
    user: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(topArtists: TopArtists) {
    super();

    const attr = topArtists["@attr"];

    this.artists = topArtists.artist.map((a) => new ConvertedTopArtist(a));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  concat(topArtists: ConvertedTopArtists) {
    if (topArtists) {
      this.artists = this.artists.concat(topArtists.artists);
    }
  }
}

export class ConvertedTopAlbum extends BaseConverter {
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

  constructor(topAlbum: TopAlbum) {
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

export class ConvertedTopAlbums
  extends BaseConverter
  implements Concatonatable<ConvertedTopAlbums>
{
  albums: ConvertedTopAlbum[];
  meta: {
    user: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(topAlbums: TopAlbums) {
    super();

    const attr = topAlbums["@attr"];

    this.albums = topAlbums.album.map((a) => new ConvertedTopAlbum(a));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  concat(topAlbums: ConvertedTopAlbums) {
    if (topAlbums) {
      this.albums = this.albums.concat(topAlbums.albums);
    }
  }
}

export class ConvertedTopTrack extends BaseConverter {
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

  constructor(topTrack: TopTrack) {
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

export class ConvertedTopTracks
  extends BaseConverter
  implements Concatonatable<ConvertedTopTracks>
{
  tracks: ConvertedTopTrack[];
  meta: {
    user: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(topTracks: TopTracks) {
    super();

    const attr = topTracks["@attr"];

    this.tracks = topTracks.track.map((t) => new ConvertedTopTrack(t));

    this.meta = {
      user: attr.page,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }

  concat(topTracks: ConvertedTopTracks) {
    if (topTracks) {
      this.tracks = this.tracks.concat(topTracks.tracks);
    }
  }
}
