import { NowPlayingService } from "../../../services/dbservices/NowPlayingService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCompact extends NowPlayingBaseCommand {
  idSeed = "fx sulli";

  aliases = ["fmc"];
  description = "Displays the now playing or last played track from Last.fm";

  getConfig(): string[] {
    return NowPlayingService.presets.blank;
  }
}
