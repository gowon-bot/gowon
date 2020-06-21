import { BaseCommand } from "../../lib/command/BaseCommand";
import { LastFMService } from "../../services/LastFMService";
import { ParentCommand, ChildCommand } from "../../lib/command/ParentCommand";

export abstract class LastFMBaseCommand extends BaseCommand {
  lastFMService = new LastFMService();
  category = "lastfm";

  // Non Discord Mention Parsing
  ndmp = {
    prefix: this.botMomentService.customPrefixes.lastfm,
  };
}

export abstract class LastFMBaseParentCommand extends ParentCommand {
  lastFMService = new LastFMService();
  category = "lastfm";

  // Non Discord Mention Parsing
  ndmp = {
    prefix: this.botMomentService.customPrefixes.lastfm,
  };
}

export abstract class LastFMBaseChildCommand extends ChildCommand {
  lastFMService = new LastFMService();
  category = "lastfm";

  // Non Discord Mention Parsing
  ndmp = {
    prefix: this.botMomentService.customPrefixes.lastfm,
  };
}
