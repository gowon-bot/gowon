import { TwitterWebhookService } from "../../api/webhooks/TwitterWebhookService";
import { BetaAccess } from "../../lib/command/access/access";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { displayLink } from "../../lib/views/displays";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { TwitterService } from "../../services/Twitter/TwitterService";

export default class TwitterLogin extends BaseCommand {
  idSeed = "ive yujin";

  description = "Connect your Twitter account to Gowon";
  aliases = ["tlogin"];

  access = new BetaAccess();

  twitterService = ServiceRegistry.get(TwitterService);
  twitterWebhookService = TwitterWebhookService.getInstance();

  async run() {
    await this.send(
      this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Twitter login"))
        .setDescription(`Please check your DMs for a login link`)
    );

    const url = this.twitterService.generateURL({ userScope: true });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Login with Twitter"))
      .setDescription(
        `To login, ${displayLink(
          "click the link",
          url.url
        )} and authenticate with Twitter!`
      );

    const sentMessage = await this.dmAuthor(embed);

    const twitterID = await this.twitterService.loginAndGetUserID(url);

    await this.usersService.setTwitterID(this.ctx, this.author.id, twitterID);

    await sentMessage.edit({
      embeds: [embed.setDescription("Successfully logged in with Twitter!")],
    });
  }
}
