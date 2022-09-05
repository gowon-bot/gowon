import { LastFMService } from "../LastFM/LastFMService";
import { ServiceRegistry } from "../ServicesRegistry";
import { StreamedTweet } from "./converters/StreamedTweet";
import { TwitterService } from "./TwitterService";
import { Payload } from "../../lib/context/Payload";
import { TwitterCommandRegistry } from "./TwitterCommandRegistry";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { GowonClient } from "../../lib/GowonClient";
import { GowonContext } from "../../lib/context/Context";
import { ExtractedCommand } from "../../lib/command/extractor/ExtractedCommand";

export class TweetHandler {
  commandRegistry!: TwitterCommandRegistry;

  constructor() {}

  get twitterService() {
    return ServiceRegistry.get(TwitterService);
  }

  get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }

  async init() {
    this.commandRegistry = new TwitterCommandRegistry(
      CommandRegistry.getInstance()
    );
  }

  async handle(tweet: StreamedTweet, gowonClient: GowonClient) {
    console.log(`Handling tweet "${tweet.content}"`);

    const command = this.commandRegistry.find({ fromTweet: tweet });

    if (command) {
      const newCommand = command.copy();

      const payload = new Payload(tweet);
      await payload.normalize(gowonClient);

      const ctx = new GowonContext({
        payload,
        gowonClient,
        extract: new ExtractedCommand([]),
      });

      await newCommand.execute.bind(newCommand)(ctx);
    }
  }
}
