import { BaseCommand } from "../../lib/command/BaseCommand";
import { LastFMService } from "../../services/LastFMService";

export abstract class LastFMBaseCommand extends BaseCommand {
  lastFMService = new LastFMService();
  category = "lastfm";

  // Non Discord Mention Parsing
  ndmp = {
    prefix: this.botMomentService.customPrefixes.lastfm,
  };
}
