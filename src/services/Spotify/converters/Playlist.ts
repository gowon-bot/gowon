import { SpotifyPlaylistTag } from "../../../database/entity/SpotifyPlaylistTag";
import { RawSpotifyPlaylist } from "../SpotifyService.types";
import {
  SpotifyEntityConverter,
  SpotifyImageCollection,
} from "./BaseConverter";
import { SpotifyUser } from "./User";

export class SpotifyPlaylist extends SpotifyEntityConverter<"playlist"> {
  isCollaborative: boolean;
  description: string;
  images: SpotifyImageCollection;
  owner: SpotifyUser;
  primaryColour?: string;
  isPublic: boolean;
  snapshotID: string;
  tracksCount: number;
  tracksHref: string;

  tag?: SpotifyPlaylistTag;

  constructor(playlist: RawSpotifyPlaylist) {
    super(playlist);

    this.isCollaborative = playlist.collaborative;
    this.description = playlist.description;
    this.primaryColour = playlist.primary_color || undefined;
    this.isPublic = playlist.public;
    this.snapshotID = playlist.snapshot_id;
    this.tracksCount = playlist.tracks.total;
    this.tracksHref = playlist.tracks.href;

    this.images = new SpotifyImageCollection(playlist.images);
    this.owner = new SpotifyUser(playlist.owner);
  }
}
