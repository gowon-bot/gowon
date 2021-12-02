import {
  RawTopAlbum,
  RawTopAlbums,
  RawTopArtist,
  RawTopArtists,
  RawTopTrack,
  RawTopTracks,
  RawUserGetWeeklyAlbumChart,
  RawUserGetWeeklyArtistChart,
  RawUserGetWeeklyTrackChart,
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

  static fromWeeklyChart(chart: RawUserGetWeeklyArtistChart) {
    return new TopArtists({
      "@attr": {
        user: chart.weeklyartistchart["@attr"].user,
        page: "1",
        perPage: `${chart.weeklyartistchart.artist.length}`,
        total: `${chart.weeklyartistchart.artist.length}`,
        totalPages: "1",
      },
      artist: chart.weeklyartistchart.artist.map((a) => ({
        "@attr": { rank: a["@attr"].rank },
        mbid: a.mbid,
        url: a.url,
        playcount: a.playcount,
        image: [],
        name: a.name,
        streamable: "0",
      })),
    });
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

  static fromWeeklyChart(chart: RawUserGetWeeklyAlbumChart) {
    return new TopAlbums({
      "@attr": {
        user: chart.weeklyalbumchart["@attr"].user,
        page: "1",
        perPage: `${chart.weeklyalbumchart.album.length}`,
        total: `${chart.weeklyalbumchart.album.length}`,
        totalPages: "1",
      },
      album: chart.weeklyalbumchart.album.map((l) => ({
        "@attr": { rank: l["@attr"].rank },
        artist: { mbid: l.artist.mbid, name: l.artist["#text"], url: "" },
        mbid: l.mbid,
        url: l.url,
        playcount: l.playcount,
        image: [],
        name: l.name,
        streamable: "0",
      })),
    });
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

  static fromWeeklyChart(chart: RawUserGetWeeklyTrackChart) {
    return new TopTracks({
      "@attr": {
        user: chart.weeklytrackchart["@attr"].user,
        page: "1",
        perPage: `${chart.weeklytrackchart.track.length}`,
        total: `${chart.weeklytrackchart.track.length}`,
        totalPages: "1",
      },
      track: chart.weeklytrackchart.track.map((t) => ({
        "@attr": { rank: t["@attr"].rank },
        artist: { mbid: t.artist.mbid, name: t.artist["#text"], url: "" },
        url: t.url,
        playcount: t.playcount,
        image: [],
        mbid: "",
        duration: "",
        name: t.name,
        streamable: { fulltrack: "", "#text": "" },
      })),
    });
  }
}
