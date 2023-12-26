import { SpotifyWebhookService } from "../../../api/webhooks/SpotifyWebhookService";
import { displayLink } from "../../../lib/ui/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyAuthenticationService } from "../../../services/Spotify/SpotifyAuthenticationService";
import { SpotifyBaseCommand } from "./SpotifyBaseCommands";

export class Login extends SpotifyBaseCommand {
  idSeed = "pink fantasy miku";

  description = "Connect your Spotify account to Gowon";
  aliases = ["spotifylogin", "slogin"];

  spotifyAuthenticationService = ServiceRegistry.get(
    SpotifyAuthenticationService
  );
  spotifyWebhookService = SpotifyWebhookService.getInstance();

  async run() {
    await this.send(
      this.authorEmbed()
        .setHeader("Spotify login")
        .setDescription(`Please check your DMs for a login link`)
    );

    const state = this.spotifyAuthenticationService.generateState();
    const url = this.spotifyAuthenticationService.generateAuthURL(state);

    const embed = this.authorEmbed()
      .setHeader("Login with Spotify")
      .setDescription(
        `To login, ${displayLink(
          "click the link",
          url
        )} and authenticate with Spotify!`
      );

    await this.dmAuthor(embed);

    const code = await this.spotifyWebhookService.waitForResponse(
      state,
      120_000 // 2 minutes
    );

    await this.spotifyAuthenticationService.handleSpotifyCodeResponse(
      this.ctx,
      { state, discordID: this.author.id },
      code
    );

    await embed
      .setDescription("Successfully logged in with Spotify!")
      .editMessage(this.ctx);
  }
}
