import { fromUnixTime } from "date-fns";
import { TweetV2SingleStreamResult } from "twitter-api-v2";
import { toInt } from "../../../helpers/lastfm/";
import { BaseSpotifyConverter } from "../../Spotify/converters/BaseConverter";

export class StreamedTweet extends BaseSpotifyConverter {
  id: string;
  content: string;
  authorID: string;
  createdAt: Date;

  constructor(tweet: TweetV2SingleStreamResult) {
    super();

    this.id = tweet.data.id;
    this.content = tweet.data.text;
    // Must be included in expansions when creating the stream
    this.authorID = tweet.data.author_id!;
    this.createdAt = fromUnixTime(toInt(tweet.data.created_at));
  }
}
