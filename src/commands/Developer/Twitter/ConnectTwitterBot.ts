import { Command } from "../../../lib/command/Command";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TwitterService } from "../../../services/Twitter/TwitterService";

export default class ConnectTwitterBot extends Command {
  idSeed = "ive gaeul";

  description = "Connect the Twitter bot to the Discord one";
  subcategory = "developer";

  secretCommand = true;
  devCommand = true;

  twitterService = ServiceRegistry.get(TwitterService);

  async run() {
    const url = this.twitterService.generateURL();

    this.dmAuthor(url.url);

    await this.twitterService.botLogin(this.ctx, url);
  }
}
