import {
  RawArtistInfo,
  RawTrackInfo,
  RawAlbumInfo,
  RawUserInfo,
  RawTagInfo,
} from "../LastFMService.types";
import { BaseConverter, ImageCollection } from "./BaseConverter";
export type LastFMUserType = "user" | "subscriber" | "alum" | "mod" | "staff";

export class ArtistInfo extends BaseConverter {
  name: string;
  url: string;
  streamable: boolean;
  ontour: boolean;
  listeners: number;
  globalPlaycount: number;
  userPlaycount: number;
  similarArtists: { name: string; url: string; images: ImageCollection }[];
  tags: string[];

  wiki: { summary: string; content: string; link: string };

  constructor(artistInfo: RawArtistInfo) {
    super();

    this.name = artistInfo.name;
    this.url = artistInfo.url;
    this.streamable = this.boolean(artistInfo.streamable);
    this.ontour = this.boolean(artistInfo.ontour);

    this.listeners = this.number(artistInfo.stats.listeners);
    this.globalPlaycount = this.number(artistInfo.stats.playcount);
    this.userPlaycount = this.number(artistInfo.stats.userplaycount);

    this.similarArtists = this.array(artistInfo?.similar?.artist).map((a) => ({
      name: a.name,
      url: a.url,
      images: new ImageCollection(a.image),
    }));

    this.tags = this.convertTags(this.array(artistInfo?.tags?.tag));
    this.wiki = {
      summary: artistInfo.bio?.summary || "",
      content: artistInfo.bio?.content || "",
      link: artistInfo.bio?.links?.link?.href || "",
    };
  }
}

export class TrackInfo extends BaseConverter {
  name: string;
  mbid: string;
  url: string;
  duration: number;
  listeners: number;
  globalPlaycount: number;
  userPlaycount: number;
  loved: boolean;

  artist: {
    name: string;
    mdid: string;
    url: string;
  };

  album?: {
    artist: string;
    name: string;
    mbid: string;
    url: string;
    images: ImageCollection;
  };

  tags: string[];

  wiki: { summary: string; content: string };

  constructor(trackInfo: RawTrackInfo) {
    super();

    this.name = trackInfo.name;
    this.mbid = trackInfo.mbid;
    this.url = trackInfo.url;
    this.duration = this.number(trackInfo.duration);

    this.listeners = this.number(trackInfo.listeners);
    this.globalPlaycount = this.number(trackInfo.playcount);
    this.userPlaycount = this.number(trackInfo.userplaycount);
    this.loved = this.boolean(trackInfo.userloved);

    this.artist = {
      name: trackInfo.artist.name,
      mdid: trackInfo.artist.mbid,
      url: trackInfo.artist.url,
    };

    if (trackInfo.album) {
      this.album = {
        artist: trackInfo.album.artist,
        name: trackInfo.album.title,
        mbid: trackInfo.album.mbid,
        url: trackInfo.album.url,
        images: new ImageCollection(trackInfo.album.image),
      };
    }

    this.tags = this.convertTags(this.array(trackInfo?.toptags?.tag));
    this.wiki = {
      summary: trackInfo.wiki?.summary || "",
      content: trackInfo.wiki?.content || "",
    };
  }
}

export class AlbumInfo extends BaseConverter {
  name: string;
  artist: string;
  url: string;
  listeners: number;
  globalPlaycount: number;
  userPlaycount: number;
  images: ImageCollection;

  tracks: {
    name: string;
    url: string;
    duration: number;
    rank: number;
    artist: {
      name: string;
      mbid: string;
      url: string;
    };
  }[];

  tags: string[];

  wiki: { summary: string; content: string };

  constructor(albumInfo: RawAlbumInfo) {
    super();

    this.name = albumInfo.name;
    this.artist = albumInfo.artist;
    this.url = albumInfo.url;
    this.listeners = this.number(albumInfo.listeners);
    this.globalPlaycount = this.number(albumInfo.playcount);
    this.userPlaycount = this.number(albumInfo.userplaycount);

    this.images = new ImageCollection(albumInfo.image);

    this.tracks = this.array(albumInfo.tracks?.track).map((t) => ({
      name: t.name,
      url: t.url,
      artist: t.artist,
      duration: this.number(t.duration),
      rank: this.number(t["@attr"].rank),
    }));

    this.tags = this.convertTags(this.array(albumInfo?.tags?.tag));
    this.wiki = {
      summary: albumInfo.wiki?.summary || "",
      content: albumInfo.wiki?.content || "",
    };
  }
}

export class UserInfo extends BaseConverter {
  playlists: number;
  scrobbleCount: number;
  name: string;
  subscriber: boolean;
  url: string;
  country: string;
  images: ImageCollection;
  registeredAt: Date;
  type: LastFMUserType;
  age: number;
  realName: string;

  constructor(userInfo: RawUserInfo) {
    super();

    this.playlists = this.number(userInfo.playlists);
    this.scrobbleCount = this.number(userInfo.playcount);
    this.name = userInfo.name;
    this.subscriber = this.boolean(userInfo.subscriber);
    this.url = userInfo.url;
    this.country = userInfo.country;
    this.images = new ImageCollection(userInfo.image);
    this.registeredAt = this.date(userInfo.registered.unixtime);
    this.type = userInfo.type as LastFMUserType;
    this.age = this.number(userInfo.age);
    this.realName = userInfo.realname;
  }
}

export class TagInfo extends BaseConverter {
  name: string;
  listeners: number;
  uses: number;
  wiki: {
    summary: string;
    content: string;
  };

  constructor(tagInfo: RawTagInfo) {
    super();

    this.name = tagInfo.name;
    this.listeners = this.number(tagInfo.total);
    this.uses = this.number(tagInfo.reach);
    this.wiki = {
      summary: tagInfo.wiki?.summary || "",
      content: tagInfo.wiki?.content || "",
    };
  }
}
