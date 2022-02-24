import { BetaAccess } from "../../../../lib/command/access/access";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { SpotifyPlaylistTagService } from "../../../../services/Spotify/SpotifyPlaylistTagService";
import { SpotifyBaseChildCommand } from "../SpotifyBaseCommands";

export abstract class PlaylistChildCommand<
  T extends ArgumentsMap = {}
> extends SpotifyBaseChildCommand<T> {
  parentName = "playlists";
  subcategory = "spotify";

  access = new BetaAccess();

  spotifyPlaylistTagService = ServiceRegistry.get(SpotifyPlaylistTagService);
}
