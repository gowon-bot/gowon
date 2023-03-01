import { SimpleMap } from "../../helpers/types";
import { Requestable } from "./LastFMAPIService";

/// ==================
//  Responses
/// ==================
export interface RawPagedCollection<T = {}> {
  "@attr": {
    page: string;
    total: string;
    user: string;
    perPage: string;
    totalPages: string;
  } & T;
}

export interface RawImage {
  size: string;
  "#text": string;
}

export interface RawTag {
  name: string;
  url: string;
}

export interface RawTrack {
  artist: { mbid: string; "#text": string };
  "@attr": { nowplaying: string };
  mbid: string;
  album: { mbid: string; "#text": string };
  image: RawImage[];
  streamable: string;
  url: string;
  name: string;
  date: {
    uts: string;
    "#text": string;
  };
}

export interface RawRecentTracks extends RawPagedCollection {
  track: RawTrack[];
}

export interface RawRecentTracksResponse {
  recenttracks: RawRecentTracks;
}

export interface RawRecentTracksExtended extends RawPagedCollection {
  track: [
    {
      "@attr": {
        nowplaying: string;
      };
      artist: {
        url: string;
        mbid: string;
        image: RawImage[];
        name: string;
      };
      mbid: string;
      image: RawImage[];
      url: string;
      streamable: string;
      album: {
        mbid: string;
        "#text": string;
      };
      name: string;
      loved: string;
    }
  ];
}

export interface RawRecentTracksExtendedResponse {
  recenttracks: RawRecentTracksExtended;
}

export interface RawTrackInfo {
  name: string;
  mbid: string;
  url: string;
  duration: string;
  streamable: { "#text": string; fulltrack: string };
  listeners: string;
  playcount: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  album: {
    artist: string;
    title: string;
    mbid: string;
    url: string;
    "@attr": { position: string };
    image: RawImage[];
  };
  userplaycount: string;
  userloved: string;
  toptags: { tag: RawTag[] };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}

export interface RawTrackInfoResponse {
  track: RawTrackInfo;
}

export interface RawArtistInfo {
  name: string;
  url: string;
  streamable: string;
  ontour: string;
  stats: { listeners: string; playcount: string; userplaycount: string };
  similar: {
    artist: {
      name: string;
      url: string;
      image: RawImage[];
    }[];
  };
  tags: { tag: RawTag[] };
  bio: {
    links: {
      link: {
        "#text": string;
        rel: string;
        href: string;
      };
    };
    published: string;
    summary: string;
    content: string;
  };
}
export interface RawArtistInfoResponse {
  artist: RawArtistInfo;
}

export interface RawAlbumInfo {
  name: string;
  artist: string;
  url: string;
  image: RawImage[];
  listeners: string;
  playcount: string;
  userplaycount: string;
  tracks: {
    track: [
      {
        name: string;
        url: string;
        duration: string;
        "@attr": { rank: string };
        streamable: { "#text": string; fulltrack: string };
        artist: {
          name: string;
          mbid: string;
          url: string;
        };
      }
    ];
  };
  tags: { tag: RawTag[] };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}
export interface RawAlbumInfoResponse {
  album: RawAlbumInfo;
}

export interface RawUserInfo {
  playlists: string;
  playcount: string;
  gender: string;
  name: string;
  subscriber: string;
  url: string;
  country: string;
  image: RawImage[];
  registered: { unixtime: string; "#text": number };
  type: string;
  age: string;
  bootstrap: string;
  realname: string;
}
export interface RawUserInfoResponse {
  user: RawUserInfo;
}

export interface RawLastFMErrorResponse {
  error: number;
  message: string;
}

export function isErrorResponse(
  response: any | RawLastFMErrorResponse
): response is RawLastFMErrorResponse {
  return !!(response as any).error;
}

export interface RawTopArtist {
  "@attr": { rank: string };
  mbid: string;
  url: string;
  playcount: string;
  image: RawImage[];
  name: string;
  streamable: string;
}
export interface RawTopArtists extends RawPagedCollection {
  artist: RawTopArtist[];
}
export interface RawTopArtistsResponse {
  topartists: RawTopArtists;
}

export interface RawTopAlbum {
  artist: {
    url: string;
    name: string;
    mbid: string;
  };
  "@attr": { rank: string };
  image: RawImage[];
  playcount: string;
  url: string;
  name: string;
  mbid: string;
}

export interface RawTopAlbums extends RawPagedCollection {
  album: RawTopAlbum[];
  "@attr": {
    page: string;
    total: string;
    user: string;
    perPage: string;
    totalPages: string;
  };
}

export interface RawTopAlbumsResponse {
  topalbums: RawTopAlbums;
}

export interface RawTopTrack {
  "@attr": { rank: string };
  duration: string;
  playcount: string;
  artist: {
    url: string;
    name: string;
    mbid: string;
  };
  image: RawImage[];
  streamable: { fulltrack: string; "#text": string };
  mbid: string;
  name: string;
  url: string;
}

export interface RawTopTracks extends RawPagedCollection {
  "@attr": {
    page: string;
    total: string;
    user: string;
    perPage: string;
    totalPages: string;
  };
  track: RawTopTrack[];
}

export interface RawTopTracksResponse {
  toptracks: RawTopTracks;
}

export interface RawTagInfo {
  name: string;
  total: number;
  reach: number;
  wiki: {
    summary: string;
    content: string;
  };
}

export interface RawTagInfoResponse {
  tag: RawTagInfo;
}

export interface RawArtistPopularTrack {
  name: string;
  playcount: string;
  listeners: string;
  url: string;
  streamable: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  image: RawImage[];
  "@attr": {
    rank: string;
  };
}

export interface RawArtistPopularTracks extends RawPagedCollection {
  track: RawArtistPopularTrack[];
}

export interface RawArtistPopularTracksResponse {
  toptracks: RawArtistPopularTracks;
}

export interface RawTagTopArtistsResponse {
  topartists: RawTagTopArtists;
}

export interface RawTagTopArtist {
  name: string;
  url: string;
  streamable: "0" | "1";
  image: RawImage[];
  "@attr": {
    rank: string;
  };
}

export interface RawTagTopArtists {
  artist: RawTagTopArtist[];
  "@attr": {
    tag: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}

export interface RawSearchedTrack {
  name: string;
  artist: string;
  url: string;
  streamable: "FIXME";
  listeners: "46498";
  image: RawImage[];
  mbid: string;
}

export interface RawSearchedAlbum {
  name: string;
  artist: string;
  url: string;
  streamable: string;
  image: RawImage[];
  mbid: string;
}

interface OpensearchQueryProperties {
  "#text": string;
  role: "request";
  startPage: string;
}

interface OpensearchProperties {
  "opensearch:Query": OpensearchQueryProperties;
  "opensearch:totalResults": string;
  "opensearch:startIndex": string;
  "opensearch:itemsPerPage": string;
  "@attr": {};
}

export interface RawTrackSearchResponse {
  results: OpensearchProperties & {
    trackmatches: { track: RawSearchedTrack[] };
  };
}

export interface RawAlbumSearchResponse {
  results: OpensearchProperties & {
    albummatches: { album: RawSearchedTrack[] };
  };
}

export interface RawGetArtistCorrectionResponse {
  corrections?: {
    correction: {
      artist: RawArtistCorrection;
      "@attr": {
        index: string;
      };
    };
  };
}

export interface RawArtistCorrection {
  name: string;
  mbid: string;
  url: string;
}

export interface RawFriend {
  playlists: string;
  playcount: string;
  subscriber: string;
  name: string;
  country: string;
  image: RawImage[];
  registered: {
    unixtime: string;
    "#text": string;
  };
  url: string;
  realname: string;
  bootstrap: string;
  type: string;
}

export interface RawFriends extends RawPagedCollection {
  user: RawFriend[];
}

export interface RawUserGetFriendsResponse {
  friends: RawFriends;
}

export interface RawTagTopTrack {
  name: string;
  duration: string;
  mbid: string;
  url: string;
  streamable: {
    "#text": string;
    fulltrack: string;
  };
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  image: RawImage[];
  "@attr": {
    rank: string;
  };
}

export interface RawTagTopTracks {
  track: RawTagTopTrack[];
  "@attr": {
    tag: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}

export interface RawTagTopTracksResponse {
  tracks: RawTagTopTracks;
}

export interface RawTagTopAlbum {
  name: string;
  mbid: string;
  url: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  image: RawImage[];
  "@attr": { rank: string };
}

export interface RawTagTopAlbums {
  album: RawTagTopAlbum[];
  "@attr": {
    tag: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}

export interface RawTagTopAlbumsResponse {
  albums: RawTagTopAlbums;
}

export interface RawLastFMSession {
  session: {
    subscriber: number;
    name: string;
    key: string;
  };
}

export interface RawWeeklyChartAttr {
  from: string;
  user: string;
  to: string;
}

export interface RawWeeklyArtist {
  mbid: string;
  url: string;
  name: string;
  playcount: string;
  "@attr": { rank: string };
}

export interface RawUserGetWeeklyArtistChart {
  weeklyartistchart: {
    artist: RawWeeklyArtist[];
    "@attr": RawWeeklyChartAttr;
  };
}

export interface RawWeeklyAlbum {
  artist: {
    mbid: string;
    "#text": string;
  };
  mbid: string;
  url: string;
  name: string;
  playcount: string;
  "@attr": { rank: string };
}

export interface RawUserGetWeeklyAlbumChart {
  weeklyalbumchart: {
    album: RawWeeklyAlbum[];
    "@attr": RawWeeklyChartAttr;
  };
}

export interface RawWeeklyTrack {
  artist: {
    mbid: string;
    "#text": string;
  };
  url: string;
  name: string;
  playcount: string;
  "@attr": { rank: string };
}

export interface RawUserGetWeeklyTrackChart {
  weeklytrackchart: {
    track: RawWeeklyTrack[];
    "@attr": RawWeeklyChartAttr;
  };
}

/// ==================
//  Inputs
/// ==================

export type Params = Record<string, any>;

export interface UsernameParams {
  username?: Requestable;
}

export interface TimeframeParams {
  from?: number;
  to?: number;
}

export interface PagedParams {
  limit?: number;
  page?: number;
}

export type LastFMPeriod =
  | "overall"
  | "7day"
  | "1month"
  | "3month"
  | "6month"
  | "12month";

export interface TimePeriodParams {
  period?: LastFMPeriod;
}

export interface RecentTracksParams
  extends UsernameParams,
    TimeframeParams,
    PagedParams {
  extended?: 0 | 1;
}

export interface TrackInfoParams extends UsernameParams {
  track: string;
  artist: string;
  autocorrect?: 0 | 1;
}

export interface ArtistInfoParams extends UsernameParams {
  artist: string;
  autocorrect?: 0 | 1;
  lang?: string;
}

export interface AlbumInfoParams extends UsernameParams {
  artist: string;
  album: string;
  autocorrect?: 0 | 1;
  lang?: string;
}

export interface UserInfoParams extends UsernameParams {}

export interface TagInfoParams {
  tag: string;
  lang?: string;
}

export interface TopArtistsParams
  extends UsernameParams,
    TimePeriodParams,
    PagedParams {}

export interface TopTracksParams
  extends UsernameParams,
    TimePeriodParams,
    PagedParams {}

export interface TopAlbumsParams
  extends UsernameParams,
    TimePeriodParams,
    PagedParams {}

export interface ArtistPopularTracksParams extends PagedParams {
  artist: string;
  autocorrect?: 0 | 1;
}

export interface TagTopArtistsParams extends PagedParams {
  tag: string;
}

export interface TrackSearchParams extends PagedParams {
  track: string;
  artist?: string;
}

export interface AlbumSearchParams extends PagedParams {
  album: string;
  artist?: string;
}

export interface ScrobbleParams {
  artist: string;
  track: string;
  timestamp: number;

  album?: string;
  albumArtist?: string;
  duration?: number;
}

export interface TrackLoveParams extends UsernameParams {
  track: string;
  artist: string;
}

export interface GetSessionParams {
  token: string;
}

export interface GetArtistCorrectionParams {
  artist: string;
}

export interface UserGetFriendsParams extends PagedParams, UsernameParams {}

export interface TagTopEntitiesParams extends PagedParams {
  tag: string;
}

export interface UserGetWeeklyChartParams
  extends UsernameParams,
    TimeframeParams,
    PagedParams {}

/// ==================
//  Functions
/// ==================

export function isTimeframeParams(
  params: SimpleMap
): params is UserGetWeeklyChartParams {
  return !!params.from || !!params.to;
}
