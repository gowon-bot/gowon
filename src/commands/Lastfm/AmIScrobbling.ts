import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class AmIScrobbling extends LastFMBaseCommand {
  aliases = ["amis"];
  description = "Am I scrobbling?";
  usage = [""];

  async run() {
    let { senderUsername } = await this.parseMentionedUsername();

    let nowPlaying = await this.lastFMService.nowPlaying(senderUsername);

    await this.reply(
      nowPlaying["@attr"]?.nowplaying === "true" ? "probably." : "probably not."
    );
  }
}
