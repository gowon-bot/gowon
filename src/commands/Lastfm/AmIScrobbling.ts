import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class AmIScrobbling extends LastFMBaseCommand {
  idSeed = "secret number denise";

  aliases = ["amis"];
  subcategory = "nowplaying";
  description = "idk are you?";
  usage = [""];

  slashCommand = true;

  async run() {
    let { senderRequestable } = await this.getMentions();

    let nowPlaying = await this.lastFMService.nowPlaying(
      this.ctx,
      senderRequestable
    );

    await this.traditionalReply(
      nowPlaying.isNowPlaying ? "probably." : "probably not."
    );
  }
}
