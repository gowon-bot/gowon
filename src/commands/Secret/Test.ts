import { BaseCommand } from "../../lib/command/BaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { SpotifyAuthenticationService } from "../../services/Spotify/SpotifyAuthenticationService";
import { SpotifyService } from "../../services/Spotify/SpotifyService";

const args = {
  inputs: {
    playlistName: { index: { start: 0 } },
  },
  mentions: {},
  flags: {},
} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;
  subcategory = "developer";

  arguments = args;

  validation: Validation = {
    playlistName: new validators.Required({}),
  };

  spotifyService = ServiceRegistry.get(SpotifyService);
  spotifyAuthenticationService = ServiceRegistry.get(
    SpotifyAuthenticationService
  );

  async run() {
    const token = await this.spotifyAuthenticationService.getTokenForUser(
      this.ctx,
      this.author.id
    );

    this.ctx.spotifyToken = token;

    await this.spotifyService.createPlaylist(
      this.ctx,
      this.parsedArguments.playlistName!
    );
  }
}
