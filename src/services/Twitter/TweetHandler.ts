import { LastFMService } from "../LastFM/LastFMService";
import { ServiceRegistry } from "../ServicesRegistry";
import { StreamedTweet } from "./converters/StreamedTweet";
import { TwitterService } from "./TwitterService";
import { Payload } from "../../lib/context/Payload";
import { TwitterCommandRegistry } from "./TwitterCommandRegistry";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { RunAs } from "../../lib/command/RunAs";
import { GowonClient } from "../../lib/GowonClient";

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

      await newCommand.execute.bind(newCommand)(
        new Payload(tweet),
        new RunAs(),
        gowonClient
      );
    }

    // if (command === "ping") {
    //   console.log("Pinging...");
    //   await this.twitterService.tweet(this.ctx, "Pong!", tweet.id);
    // } else if (command === "fm") {
    //   console.log("Sending nowplaying");

    //   const nowPlaying = await this.lastFMService.nowPlaying(
    //     this.ctx,
    //     "flushed_emoji"
    //   );

    //   await this.twitterService.tweet(
    //     this.ctx,
    //     `🎶 ${
    //       nowPlaying.isNowPlaying ? "Now playing" : "Last scrobbled"
    //     } for flushed_emoji:\n\n${nowPlaying.name} by ${
    //       nowPlaying.artist
    //     }\nfrom ${nowPlaying.album}`,
    //     tweet.id
    //   );
    // }
  }
}
