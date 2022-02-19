import { BaseCommand } from "../../lib/command/BaseCommand";
import { ParentCommand, ChildCommand } from "../../lib/command/ParentCommand";
import { SpotifyService } from "../../services/Spotify/SpotifyService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { ArgumentsMap } from "../../lib/context/arguments/types";

export abstract class LastFMBaseCommand<
  T extends ArgumentsMap = {}
> extends BaseCommand<T> {
  lastFMService = ServiceRegistry.get(LastFMService);
  spotifyService = ServiceRegistry.get(SpotifyService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);

  category = "lastfm";
}

export abstract class LastFMBaseParentCommand extends ParentCommand {
  category = "lastfm";
}

export abstract class LastFMBaseChildCommand<
  T extends ArgumentsMap = {}
> extends ChildCommand<T> {
  lastFMService = ServiceRegistry.get(LastFMService);
  spotifyService = ServiceRegistry.get(SpotifyService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);

  category = "lastfm";
}
