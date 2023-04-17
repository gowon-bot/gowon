import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCompact extends NowPlayingBaseCommand {
  idSeed = "fx sulli";

  aliases = ["fmc"];
  description = "Displays the now playing or last played track from Last.fm";

  async run() {
    const { username, requestable } = await this.getMentions({
      fetchDiscordUser: false,
    });

    const nowPlaying = await this.lastFMService.nowPlaying(
      this.ctx,
      requestable
    );

    const nowPlayingEmbed = await this.nowPlayingEmbed(nowPlaying, username);

    const sentMessage = await this.send(nowPlayingEmbed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }
}
