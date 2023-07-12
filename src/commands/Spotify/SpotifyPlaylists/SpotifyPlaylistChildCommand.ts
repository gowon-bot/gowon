import { PrivateModeOnWarning } from "../../../errors/external/spotify";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { toggleValues } from "../../../lib/settings/SettingValues";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyPlaylistTagService } from "../../../services/Spotify/SpotifyPlaylistTagService";
import { SpotifyBaseChildCommand } from "../SpotifyBaseCommands";

export abstract class SpotifyPlaylistChildCommand<
  T extends ArgumentsMap = {}
> extends SpotifyBaseChildCommand<T> {
  parentName = "playlists";
  subcategory = "spotify";

  slashCommand = true;

  spotifyPlaylistTagService = ServiceRegistry.get(SpotifyPlaylistTagService);

  async beforeRun() {
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
