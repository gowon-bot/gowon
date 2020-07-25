import { Message } from "discord.js";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class AmIScrobbling extends LastFMBaseCommand {
  aliases = ["amis"]
  description = "Am I scrobbling?";
  secretCommand = true;

  async run(message: Message) {
    let { senderUsername } = await this.parseMentionedUsername(message);

    let nowPlaying = await this.lastFMService.nowPlaying(senderUsername);

    await message.reply(
      nowPlaying["@attr"]?.nowplaying === "true" ? "probably." : "probably not."
    );
  }
}
