import { ArtistInfo, TrackInfo } from "../LastFMService.types";
import { BaseConverter } from "./BaseConverter";
import { ImageCollection } from "./shared";

export class ConvertedArtistInfo extends BaseConverter {
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

  constructor(artistInfo: ArtistInfo) {
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

export class ConvertedTrackInfo extends BaseConverter {
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

  constructor(trackInfo: TrackInfo) {
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

    if (trackInfo.album)
      this.album = {
        artist: trackInfo.album.artist,
        name: trackInfo.album.title,
        mbid: trackInfo.album.mbid,
        url: trackInfo.album.url,
        images: new ImageCollection(trackInfo.album.image),
      };

    this.tags = this.convertTags(this.array(trackInfo?.toptags?.tag));
    this.wiki = {
      summary: trackInfo.wiki?.summary || "",
      content: trackInfo.wiki?.content || "",
    };
  }
}
