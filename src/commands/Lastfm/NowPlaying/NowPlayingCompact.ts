import { parseLastFMTrackResponse } from "../../../helpers/lastFM";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCompact extends NowPlayingBaseCommand {
  idSeed = "fx sulli";
  
  aliases = ["npc", "fmc"];
  description = "Displays the now playing or last played track from Last.fm";

  async run() {
    let { username } = await this.nowPlayingMentions({ noDiscordUser: true });

    let nowPlaying = await this.lastFMService.nowPlaying(username);

    let track = parseLastFMTrackResponse(nowPlaying);

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username);

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.easterEggs(sentMessage, track);
  }
}
