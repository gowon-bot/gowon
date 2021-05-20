import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class AmIScrobbling extends LastFMBaseCommand {
  idSeed = "secret number denise";

  aliases = ["amis"];
  subcategory = "nowplaying";
  description = "Am I scrobbling?";
  usage = [""];

  async run() {
    let { senderUsername } = await this.parseMentions();

    let nowPlaying = await this.lastFMService.nowPlaying(senderUsername);

    await this.traditionalReply(
      nowPlaying.isNowPlaying ? "probably." : "probably not."
    );
  }
}
