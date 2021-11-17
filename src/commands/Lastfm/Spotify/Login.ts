import { SpotifyWebhookService } from "../../../api/webhooks/SpotifyWebhookService";
import { Arguments } from "../../../lib/arguments/arguments";
import { displayLink } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyAuthenticationService } from "../../../services/Spotify/SpotifyAuthenticationService";
import { SpotifyBaseCommand } from "./SpotifyBaseCommand";

const args = {} as const;

export default class Login extends SpotifyBaseCommand<typeof args> {
  idSeed = "dreamnote boni";

  description = "Connect your Spotify account to Gowon";
  aliases = ["spotifylogin", "slogin"];

  arguments: Arguments = args;

  spotifyAuthenticationService = ServiceRegistry.get(
    SpotifyAuthenticationService
  );
  spotifyWebhookService = SpotifyWebhookService.getInstance();

  async run() {
    await this.send(
      this.newEmbed()
        .setAuthor(...this.generateEmbedAuthor("Spotify login"))
        .setDescription(`Please check your DMs for a login link`)
    );

    const state = this.spotifyAuthenticationService.generateState();
    const url = this.spotifyAuthenticationService.generateAuthURL(state);

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Login with Spotify"))
      .setDescription(
        `Click ${displayLink("here", url)} to authenticate with Spotify!`
      );

    const sentMessage = await this.dmAuthor(embed);

    const code = await this.spotifyWebhookService.waitForResponse(
      state,
      120_000 // 2 minutes
    );

    await this.spotifyAuthenticationService.handleSpotifyCodeResponse(
      this.ctx,
      { state, discordID: this.author.id },
      code
    );

    await sentMessage.edit({
      embeds: [embed.setDescription("Successfully logged in with Spotify!")],
    });
  }
}
