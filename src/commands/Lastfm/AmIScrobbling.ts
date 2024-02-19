import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class AmIScrobbling extends LastFMBaseCommand {
  idSeed = "secret number denise";

  aliases = ["amis"];
  subcategory = "nowplaying";
  description = "idk are you?";
  usage = [""];

  slashCommand = true;

  async run() {
    const { senderRequestable } = await this.getMentions();

    const nowPlaying = await this.lastFMService.nowPlaying(
      this.ctx,
      senderRequestable
    );

    await this.reply(nowPlaying.isNowPlaying ? "Probably." : "Probably not.");
  }
}
