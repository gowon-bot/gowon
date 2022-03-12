import {
  TweetV2SingleStreamResult,
  TweetStream as _TweetStream,
  ETwitterStreamEvent,
} from "twitter-api-v2";
import { BaseTwitterConverter } from "./BaseConverter";
import { StreamedTweet } from "./StreamedTweet";

type StreamCallback = (tweet: StreamedTweet) => Promise<void> | void;

export class TweetStream extends BaseTwitterConverter {
  private unsubscribed = false;

  constructor(private stream: _TweetStream<TweetV2SingleStreamResult>) {
    super();
  }

  async init(): Promise<void> {
    this.stream.on(ETwitterStreamEvent.ConnectionError, (e) =>
      console.log("Connection error\n", e)
    );

    this.stream.on(ETwitterStreamEvent.Connected, () =>
      console.log("Connected to Twitter!")
    );
  }

  async connect() {
    console.log("Connecting...");
    await this.stream.connect({ autoReconnect: true });
    console.log("Connected!");
  }

  subscribe(callback: StreamCallback) {
    this.stream.on(ETwitterStreamEvent.Data, (data) => {
      callback(new StreamedTweet(data));
    });
  }

  unsubscribe() {
    if (!this.unsubscribed) {
      console.log("Destroying stream!");

      this.stream.destroy();
      this.unsubscribed = true;

      console.log("Destroyed stream.");
    }
  }
}
