import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class AmIScrobbling extends LastFMBaseCommand {
  idSeed = "secret number denise";

  aliases = ["amis"];
  subcategory = "nowplaying";
  description = "Am I scrobbling?";
  usage = [""];

  async run() {
    let { senderRequestable } = await this.parseMentions();

    let nowPlaying = await this.lastFMService.nowPlaying(
      this.ctx,
      senderRequestable
    );

    await this.traditionalReply(
      nowPlaying.isNowPlaying ? "probably." : "probably not."
    );
  }
}
