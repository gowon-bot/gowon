import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingAlbum extends NowPlayingBaseCommand {
  idSeed = "fx amber";

  aliases = ["fml", "npl", "fma"];
  description =
    "Displays the now playing or last played track from Last.fm, including some album information";

  crownsService = ServiceRegistry.get(CrownsService);

  getConfig(): string[] {
    return [
      "artist-plays",
      "album-plays",
      "artist-tags",
      "album-tags",
      "artist-crown",
      "loved",
    ];
  }
}
