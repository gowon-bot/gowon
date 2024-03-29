import {
  RawArtistCorrection,
  RawArtistPopularTrack,
  RawArtistPopularTracks,
  RawFriends,
  RawLastFMSession,
  RawTagTopAlbum,
  RawTagTopAlbums,
  RawTagTopArtist,
  RawTagTopArtists,
  RawTagTopTrack,
  RawTagTopTracks,
  RawUserInfo,
} from "../LastFMService.types";
import { BaseLastFMConverter, ImageCollection } from "./BaseConverter";
import { UserInfo } from "./InfoTypes";

export class ArtistPopularTrack extends BaseLastFMConverter {
  name: string;
  globalPlaycount: number;
  listeners: number;
  url: string;
  streamable: boolean;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  images: ImageCollection;
  rank: number;

  constructor(track: RawArtistPopularTrack) {
    super();

    this.name = track.name;
    this.globalPlaycount = this.number(track.playcount);
    this.listeners = this.number(track.listeners);
    this.url = track.url;
    this.streamable = this.boolean(track.streamable);
    this.artist = track.artist;
    this.images = new ImageCollection(track.image);
    this.rank = this.number(track["@attr"].rank);
  }
}

export class ArtistPopularTracks extends BaseLastFMConverter {
  tracks: ArtistPopularTrack[];
  meta: {
    artist: string;
    page: number;
    total: number;
    perPage: number;
    totalPages: number;
  };

  constructor(popularTracks: RawArtistPopularTracks) {
    super();

    const attr = popularTracks["@attr"];

    this.tracks = popularTracks.track.map((t) => new ArtistPopularTrack(t));

    this.meta = {
      artist: (attr as any).artist,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class TagTopArtist extends BaseLastFMConverter {
  name: string;
  url: string;
  streamable: boolean;
  images: ImageCollection;
  rank: number;

  constructor(tagTopArtist: RawTagTopArtist) {
    super();

    this.name = tagTopArtist.name;
    this.url = tagTopArtist.url;
    this.streamable = this.boolean(tagTopArtist.streamable);
    this.images = new ImageCollection(tagTopArtist.image);
    this.rank = this.number(tagTopArtist["@attr"].rank);
  }
}

export class TagTopArtists extends BaseLastFMConverter {
  artists: TagTopArtist[];
  meta: {
    tag: string;
    page: number;
    perPage: number;
    totalPages: number;
    total: number;
  };

  constructor(tagTopArtists: RawTagTopArtists) {
    super();

    const attr = tagTopArtists["@attr"];

    this.artists = tagTopArtists.artist.map((a) => new TagTopArtist(a));

    this.meta = {
      tag: attr.tag,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class ArtistCorrection extends BaseLastFMConverter {
  name: string;
  mbid: string;
  url: string;

  constructor(artistCorrection: RawArtistCorrection) {
    super();

    this.name = artistCorrection.name;
    this.mbid = artistCorrection.mbid;
    this.url = artistCorrection.url;
  }
}

export class Friends extends BaseLastFMConverter {
  friends: UserInfo[];
  meta: {
    user: string;
    page: number;
    perPage: number;
    totalPages: number;
    total: number;
  };

  constructor(friends: RawFriends) {
    super();

    const attr = friends["@attr"];

    this.friends = friends.user.map(
      // a friend and user info are identical except friends are missing `gender`
      (f) => new UserInfo(f as any as RawUserInfo)
    );

    this.meta = {
      user: attr.user,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class TagTopTrack extends BaseLastFMConverter {
  name: string;
  duration: number;
  mbid: string;
  url: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  images: ImageCollection;
  rank: number;

  constructor(tagTopTrack: RawTagTopTrack) {
    super();

    this.name = tagTopTrack.name;
    this.duration = this.number(tagTopTrack.duration);
    this.url = tagTopTrack.url;
    this.mbid = tagTopTrack.mbid;
    this.artist = tagTopTrack.artist;
    this.images = new ImageCollection(tagTopTrack.image);
    this.rank = this.number(tagTopTrack["@attr"].rank);
  }
}

export class TagTopTracks extends BaseLastFMConverter {
  tracks: TagTopTrack[];
  meta: {
    tag: string;
    page: number;
    perPage: number;
    totalPages: number;
    total: number;
  };

  constructor(tagTopTracks: RawTagTopTracks) {
    super();

    const attr = tagTopTracks["@attr"];

    this.tracks = tagTopTracks.track.map((t) => new TagTopTrack(t));

    this.meta = {
      tag: attr.tag,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class TagTopAlbum extends BaseLastFMConverter {
  name: string;
  mbid: string;
  url: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  images: ImageCollection;
  rank: number;

  constructor(tagTopAlbum: RawTagTopAlbum) {
    super();

    this.name = tagTopAlbum.name;
    this.url = tagTopAlbum.url;
    this.mbid = tagTopAlbum.mbid;
    this.artist = tagTopAlbum.artist;
    this.images = new ImageCollection(tagTopAlbum.image);
    this.rank = this.number(tagTopAlbum["@attr"].rank);
  }
}

export class TagTopAlbums extends BaseLastFMConverter {
  albums: TagTopAlbum[];
  meta: {
    tag: string;
    page: number;
    perPage: number;
    totalPages: number;
    total: number;
  };

  constructor(tagTopAlbums: RawTagTopAlbums) {
    super();

    const attr = tagTopAlbums["@attr"];

    this.albums = tagTopAlbums.album.map((l) => new TagTopAlbum(l));

    this.meta = {
      tag: attr.tag,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class LastFMSession extends BaseLastFMConverter {
  isSubscriber: boolean;
  username: string;
  key: string;

  constructor(lastFMSession: RawLastFMSession) {
    super();

    this.isSubscriber = this.boolean(lastFMSession.session.subscriber);
    this.username = lastFMSession.session.name;
    this.key = lastFMSession.session.key;
  }
}
