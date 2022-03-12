import { BaseCommand } from "../../lib/command/BaseCommand";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { TwitterService } from "../../services/Twitter/TwitterService";

const args = {} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123...4???";
  subcategory = "developer";

  secretCommand = true;
  arguments = args;
  slashCommand = true;
  twitterCommand = true;

  twitterService = ServiceRegistry.get(TwitterService);

  async run() {
    await this.responder.all(this.ctx, "Hello, world!");
  }
}
