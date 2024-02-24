import { NowPlayingService } from "../../../services/dbservices/NowPlayingService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingVerbose extends NowPlayingBaseCommand {
  idSeed = "fx luna";

  aliases = ["npv", "fmv", "fmt"];
  description =
    "Displays the now playing or last played track from Last.fm, including some track information";

  getConfig(): string[] {
    return NowPlayingService.presets.verbose;
  }
}
