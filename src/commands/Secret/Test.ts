import { BaseCommand } from "../../lib/command/BaseCommand";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { TwitterService } from "../../services/Twitter/TwitterService";

const args = {
  tweetContent: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "Dumb shit goes here",
  }),
} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123...4???";
  subcategory = "developer";

  secretCommand = true;
  arguments = args;
  slashCommand = true;
  twitterCommand = true;

  twitterService = ServiceRegistry.get(TwitterService);
  lastFMService = ServiceRegistry.get(LastFMService);

  async run() {
    await this.responder.all(this.ctx, "Hello, world!");

    // const url = this.twitterService.generateURL();
    // console.log(url);
    // await this.twitterService.botLogin(this.ctx, url);
  }
}
