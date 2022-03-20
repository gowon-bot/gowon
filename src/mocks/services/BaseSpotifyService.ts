import { SpotifyToken } from "../../services/Spotify/converters/Auth";
import {
  SpotifyID,
  SpotifyURI,
} from "../../services/Spotify/converters/BaseConverter";
import { SpotifyItemCollection } from "../../services/Spotify/converters/ItemCollection";
import { SpotifyPlaylist } from "../../services/Spotify/converters/Playlist";
import {
  SpotifyAlbumSearch,
  SpotifyArtistSearch,
  SpotifyTrackSearch,
} from "../../services/Spotify/converters/Search";
import { SpotifyTrack } from "../../services/Spotify/converters/Track";
import {
  SpotifyRequestOptions,
  SpotifySearchParams,
  SpotifyServiceContext,
} from "../../services/Spotify/SpotifyService";
import {
  RawSearchResponse,
  RawSpotifyURI,
  SpotifyEntityName,
  SpotifySnapshot,
} from "../../services/Spotify/SpotifyService.types";
import { BaseMockService } from "./BaseMockService";

export class MockSpotifyService extends BaseMockService {
  generateURI<T extends SpotifyEntityName>(
    entity: T,
    id: string
  ): SpotifyURI<T> {
    return new SpotifyURI(`spotify:${entity}:${id}`);
  }

  async fetchToken(
    _ctx: SpotifyServiceContext,
    _options: { code?: string; refreshToken?: string } = {}
  ): Promise<SpotifyToken> {
    return new SpotifyToken({} as any);
  }

  async request<T>(
    _ctx: SpotifyServiceContext,
    _options: SpotifyRequestOptions
  ): Promise<T | undefined> {
    return undefined;
  }

  // Search
  async search(
    _ctx: SpotifyServiceContext,
    _querystring: string,
    _entityType: [SpotifyEntityName] | [] = []
  ): Promise<RawSearchResponse<any>> {
    return {} as any;
  }

  async searchArtist(
    _ctx: SpotifyServiceContext,
    artist: string
  ): Promise<SpotifyArtistSearch> {
    return new SpotifyArtistSearch({} as any, artist);
  }

  async searchAlbum(
    _ctx: SpotifyServiceContext,
    params: SpotifySearchParams<{ artist: string; album: string }>
  ): Promise<SpotifyAlbumSearch> {
    return new SpotifyAlbumSearch({} as any, params);
  }

  async searchTrack(
    _ctx: SpotifyServiceContext,
    params: SpotifySearchParams<{ artist: string; track: string }>
  ): Promise<SpotifyTrackSearch> {
    return new SpotifyTrackSearch({} as any, params);
  }

  // Tracks
  async getTrack(
    _ctx: SpotifyServiceContext,
    _id: SpotifyID
  ): Promise<SpotifyTrack> {
    return new SpotifyTrack({} as any);
  }

  // Player
  async queue(
    _ctx: SpotifyServiceContext,
    _uri: RawSpotifyURI<"track">
  ): Promise<void> {}

  async next(_ctx: SpotifyServiceContext): Promise<void> {}

  // Playlists
  async getPlaylists(
    _ctx: SpotifyServiceContext
  ): Promise<SpotifyItemCollection<"playlist", SpotifyPlaylist>> {
    return new SpotifyItemCollection<"playlist", SpotifyPlaylist>(
      {} as any,
      SpotifyPlaylist
    );
  }

  async addToPlaylist(
    _ctx: SpotifyServiceContext,
    _playlistID: string,
    _uris: RawSpotifyURI<"track">[]
  ): Promise<SpotifySnapshot> {
    return { snapshot_id: "" };
  }

  async removeFromPlaylist(
    _ctx: SpotifyServiceContext,
    _playlistID: string,
    _uris: RawSpotifyURI<"track">[]
  ): Promise<SpotifySnapshot> {
    return { snapshot_id: "" };
  }

  // Library
  async saveTrackToLibrary(
    _ctx: SpotifyServiceContext,
    _id: SpotifyID
  ): Promise<void> {}

  async removeTrackFromLibrary(
    _ctx: SpotifyServiceContext,
    _id: SpotifyID
  ): Promise<void> {}

  async checkIfSongIsInLibrary(
    _ctx: SpotifyServiceContext,
    _id: SpotifyID
  ): Promise<boolean> {
    return false;
  }

  getKeywords(_params: SpotifySearchParams<any>): string {
    return "";
  }
}
