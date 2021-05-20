import {
  RawArtistCorrection,
  RawArtistPopularTrack,
  RawArtistPopularTracks,
  RawFriends,
  RawSearchedTrack,
  RawTagTopArtist,
  RawTagTopArtists,
  RawTagTopTrack,
  RawTagTopTracks,
  RawTrackSearchResponse,
  RawUserInfo,
} from "../LastFMService.types";
import { BaseConverter, ImageCollection } from "./BaseConverter";
import { UserInfo } from "./InfoTypes";

export class ArtistPopularTrack extends BaseConverter {
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

export class ArtistPopularTracks extends BaseConverter {
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

    this.tracks = popularTracks.track.map(
      (t) => new ArtistPopularTrack(t)
    );

    this.meta = {
      artist: (attr as any).artist,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class TagTopArtist extends BaseConverter {
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

export class TagTopArtists extends BaseConverter {
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

    this.artists = tagTopArtists.artist.map(
      (a) => new TagTopArtist(a)
    );

    this.meta = {
      tag: attr.tag,
      page: this.number(attr.page),
      perPage: this.number(attr.perPage),
      total: this.number(attr.total),
      totalPages: this.number(attr.totalPages),
    };
  }
}

export class SearchedTrack extends BaseConverter {
  name: string;
  artist: string;
  url: string;
  streamable: "FIXME";
  listeners: number;
  image: ImageCollection;
  mbid: string;

  constructor(searchedTrack: RawSearchedTrack) {
    super();

    this.name = searchedTrack.name;
    this.artist = searchedTrack.artist;
    this.url = searchedTrack.url;
    this.streamable = searchedTrack.streamable;
    this.listeners = this.number(searchedTrack.listeners);
    this.image = new ImageCollection(searchedTrack.image);
    this.mbid = searchedTrack.mbid;
  }
}

export class TrackSearch extends BaseConverter {
  tracks: SearchedTrack[];
  meta: {
    query: string;
    startPage: number;
    total: number;
    perPage: number;
  };

  constructor(trackSearch: RawTrackSearchResponse) {
    super();

    this.tracks = trackSearch.results.trackmatches.track.map(
      (t) => new SearchedTrack(t)
    );

    this.meta = {
      query: trackSearch.results["opensearch:Query"]["#text"],
      startPage: this.number(trackSearch.results["opensearch:Query"].startPage),
      total: this.number(trackSearch.results["opensearch:totalResults"]),
      perPage: this.number(trackSearch.results["opensearch:itemsPerPage"]),
    };
  }
}

export class ArtistCorrection extends BaseConverter {
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

export class Friends extends BaseConverter {
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

export class TagTopTrack extends BaseConverter {
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

export class TagTopTracks extends BaseConverter {
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
