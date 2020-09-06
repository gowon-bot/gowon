import {
  RecentTracks,
  Track,
  ArtistInfo,
  AlbumInfo,
  UserInfo,
  TopArtists,
  TopAlbums,
  TopTracks,
  TrackInfo,
  TagInfo,
  ArtistTopTracks,
  Params,
  RecentTracksParams,
  TrackInfoParams,
  ArtistInfoParams,
  AlbumInfoParams,
  UserInfoParams,
  TagInfoParams,
  TopArtistsParams,
  LastFMPeriod,
  TopAlbumsParams,
  TopTracksParams,
  ArtistTopTracksParams,
  Image,
  TagTopArtistsParams,
  TagTopArtists,
} from "../../services/LastFMService.types";
import { BaseService } from "../../services/BaseService";
import { LastFMScraper } from "../../services/scrapingServices/LastFMScraper";
import { ParsedTrack } from "../../helpers/lastFM";

function pagedResponse<T>(object: any): T {
  return {
    "@attr": {
      page: "1",
      total: "1",
      user: "flushed_emoji",
      perPage: "1",
      totalPages: "1",
    },
    ...object,
  };
}

function fakeImages(): Image[] {
  return [
    {
      "#text":
        "https://kprofiles.com/wp-content/uploads/2018/05/gowon2-430x800.jpg",
      size: "small",
    },
    {
      "#text":
        "https://kprofiles.com/wp-content/uploads/2018/05/gowon2-430x800.jpg",
      size: "large",
    },
    {
      "#text":
        "https://kprofiles.com/wp-content/uploads/2018/05/gowon2-430x800.jpg",
      size: "huge",
    },
  ];
}

function fakeTrack(): Track {
  return {
    artist: { mbid: "string", "#text": "artist" },
    "@attr": { nowplaying: "0" },
    mbid: "string",
    album: { mbid: "string", "#text": "album" },
    image: fakeImages(),
    streamable: "0",
    url: "http://google.ca",
    name: "track",
  };
}

export class LastFMMock extends BaseService {
  url = "";
  scraper: LastFMScraper = new LastFMScraper();

  get apikey(): string {
    return "";
  }

  buildParams(_: Params): string {
    return "";
  }

  async request<T>(_: string, __: Params): Promise<T> {
    return {} as T;
  }

  async recentTracks(_: RecentTracksParams): Promise<RecentTracks> {
    return pagedResponse<RecentTracks>({
      track: [fakeTrack()],
    });
  }

  async nowPlaying(_: string): Promise<Track> {
    return {
      ...fakeTrack(),
      name: "nowplayingtrack",
      artist: { "#text": "nowplayingartist", mbid: "" },
      album: { "#text": "nowplayingalbum", mbid: "" },
    };
  }

  async nowPlayingParsed(_: string): Promise<ParsedTrack> {
    return {
      name: "nowplayingtrack",
      album: "nowplayingalbum",
      artist: "nowplayingartist",
    };
  }

  async getMilestone(_: string, __: number): Promise<Track> {
    return fakeTrack();
  }

  async getNumberScrobbles(_: string, __?: Date, ___?: Date): Promise<number> {
    return 10;
  }

  async trackInfo(params: TrackInfoParams): Promise<TrackInfo> {
    return {
      name: params.track,
      mbid: "string",
      url: "https://google.ca",
      duration: "string",
      streamable: { "#text": "string", fulltrack: "string" },
      listeners: "string",
      playcount: "string",
      artist: {
        name: params.artist,
        mbid: "string",
        url: "string",
      },
      album: {
        artist: "artist",
        title: "album",
        mbid: "string",
        url: "string",
        "@attr": { position: "1" },
      },
      userplaycount: "10",
      userloved: "string",
      toptags: { tag: [{ name: "tag", url: "https://google.ca" }] },
      wiki: {
        published: "string",
        summary: "string",
        content: "string",
      },
    } as TrackInfo;
  }

  async artistInfo(params: ArtistInfoParams): Promise<ArtistInfo> {
    return {
      name: params.artist,
      url: "string",
      streamable: "string",
      ontour: "string",
      stats: {
        listeners: "1",
        playcount: "1",
        userplaycount: "1",
      },
      similar: {
        artist: [
          {
            name: "string",
            url: "string",
            image: fakeImages(),
          },
        ],
      },
      tags: { tag: [{ name: "tag", url: "https://google.ca" }] },
      bio: {
        links: {
          link: {
            "#text": "string",
            rel: "string",
            href: "string",
          },
        },
        published: "string",
        summary: "string",
        content: "string",
      },
    };
  }

  async albumInfo(params: AlbumInfoParams): Promise<AlbumInfo> {
    return {
      name: params.album,
      artist: params.artist,
      url: "string",
      image: fakeImages(),
      listeners: "1",
      playcount: "1",
      userplaycount: "1",
      tracks: {
        track: [
          {
            name: "string",
            url: "string",
            duration: "string",
            "@attr": { rank: "1" },
            streamable: { "#text": "string", fulltrack: "1" },
            artist: {
              name: "string",
              mbid: "string",
              url: "https://google.ca",
            },
          },
        ],
      },
      tags: { tag: [{ name: "tag", url: "https://google.ca" }] },
      wiki: {
        published: "string",
        summary: "string",
        content: "string",
      },
    };
  }

  async userInfo(_: UserInfoParams): Promise<UserInfo> {
    return {
      playlists: "string",
      playcount: "string",
      gender: "string",
      name: "string",
      subscriber: "string",
      url: "string",
      country: "string",
      image: fakeImages(),
      registered: { unixtime: "string", "#text": 1000000 },
      type: "string",
      age: "string",
      bootstrap: "string",
      realname: "string",
    };
  }

  async userExists(_: string): Promise<boolean> {
    return true;
  }

  async tagInfo(_: TagInfoParams): Promise<TagInfo> {
    return {
      name: "tag",
      total: 1,
      reach: 1,
      wiki: {
        summary: "string",
        content: "string",
      },
    };
  }

  async topArtists(_: TopArtistsParams): Promise<TopArtists> {
    return pagedResponse({
      artist: [
        {
          "@attr": { rank: "1" },
          mbid: "string",
          url: "string",
          playcount: "10",
          image: fakeImages(),
          name: "artist",
          streamable: "string",
        },
      ],
    });
  }

  async artistCount(_: string, __: LastFMPeriod = "overall"): Promise<number> {
    return 1;
  }

  async topAlbums(_: TopAlbumsParams): Promise<TopAlbums> {
    return pagedResponse({
      album: [
        {
          artist: {
            url: "https://google.ca",
            name: "artist",
            mbid: "string",
          },
          "@attr": { rank: "1" },
          image: fakeImages(),
          playcount: "1",
          url: "string",
          name: "string",
          mbid: "string",
        },
      ],
    });
  }

  async albumCount(_: string, __: LastFMPeriod = "overall"): Promise<number> {
    return 1;
  }

  async topTracks(_: TopTracksParams): Promise<TopTracks> {
    return pagedResponse({
      track: [
        {
          "@attr": { rank: "1" },
          duration: "1",
          playcount: "1",
          artist: {
            url: "https://google.ca",
            name: "artist",
            mbid: "string",
          },
          image: fakeImages(),
          streamable: { fulltrack: "1", "#text": "1" },
          mbid: "string",
          name: "track",
          url: "string",
        },
      ],
    });
  }

  async trackCount(_: string, __: LastFMPeriod = "overall"): Promise<number> {
    return 1;
  }

  async goBack(_: string, __: Date): Promise<Track> {
    return fakeTrack();
  }

  async artistTopTracks(_: ArtistTopTracksParams): Promise<ArtistTopTracks> {
    return pagedResponse({
      track: [
        {
          name: "track",
          playcount: "1",
          listeners: "1",
          url: "https://google.ca",
          streamable: "1",
          artist: {
            name: "string",
            mbid: "string",
            url: "string",
          },
          image: fakeImages(),
          "@attr": {
            rank: "1",
          },
        },
      ],
    });
  }

  async getArtistPlays(_: string, __: string): Promise<number> {
    return 0;
  }

  async correctArtist(params: ArtistInfoParams): Promise<string> {
    return (await this.artistInfo(params)).name;
  }

  async correctAlbum(
    _: AlbumInfoParams
  ): Promise<{ artist: string; album: string }> {
    return {
      artist: "artist",
      album: "album",
    };
  }

  async correctTrack(
    _: TrackInfoParams
  ): Promise<{ artist: string; track: string }> {
    return {
      artist: "artist",
      track: "track",
    };
  }

  async tagTopArtists(_: TagTopArtistsParams): Promise<TagTopArtists> {
    return {
      artist: [
        {
          name: "tag",
          url: "https://google.ca",
          streamable: "0",
          image: fakeImages(),
          "@attr": {
            rank: "1",
          },
        },
      ],
      "@attr": {
        tag: "tag",
        page: "1",
        perPage: "1",
        totalPages: "1",
        total: "1",
      },
    };
  }
}
