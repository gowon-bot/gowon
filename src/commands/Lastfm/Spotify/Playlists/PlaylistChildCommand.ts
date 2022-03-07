import { PrivateModeOnWarning } from "../../../../errors/spotify";
import { BetaAccess } from "../../../../lib/command/access/access";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { toggleValues } from "../../../../lib/settings/Settings";
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

  async prerun() {
    this.warnIfPrivate();
  }

  protected warnIfPrivate() {
    const privateMode = this.settingsService.get("spotifyPrivateMode", {
      userID: this.author.id,
    });

    if (privateMode === toggleValues.ON) {
      throw new PrivateModeOnWarning(this.prefix);
    }
  }
}
