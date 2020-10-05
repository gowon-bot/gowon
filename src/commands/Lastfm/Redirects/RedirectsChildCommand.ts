import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";

export abstract class RedirectsChildCommand extends LastFMBaseChildCommand {
  parentName = "redirects";

  redirectsService = new RedirectsService(this.logger);
}
