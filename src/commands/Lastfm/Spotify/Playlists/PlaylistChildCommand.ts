import { Arguments } from "../../../../lib/arguments/arguments";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { SpotifyPlaylistTagService } from "../../../../services/Spotify/SpotifyPlaylistTagService";
import { SpotifyBaseChildCommand } from "../SpotifyBaseCommands";

export abstract class PlaylistChildCommand<
  T extends Arguments = Arguments
> extends SpotifyBaseChildCommand<T> {
  parentName = "playlists";
  subcategory = "spotify";

  spotifyPlaylistTagService = ServiceRegistry.get(SpotifyPlaylistTagService);
}
