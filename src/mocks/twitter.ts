import { StreamedTweet } from "../services/Twitter/converters/StreamedTweet";

export class MockTweet extends StreamedTweet {
  constructor(content: string = "hello world") {
    super({
      data: {
        id: "tweetid",
        author_id: "authorid",
        text: content,
      },
      matching_rules: [],
    });
  }
}
