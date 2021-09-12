import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCompact extends NowPlayingBaseCommand {
  idSeed = "fx sulli";

  aliases = ["fmc"];
  description = "Displays the now playing or last played track from Last.fm";

  async run() {
    let { username, requestable } = await this.nowPlayingMentions({
      noDiscordUser: true,
    });

    let nowPlaying = await this.lastFMService.nowPlaying(this.ctx, requestable);

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username);

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }
}
