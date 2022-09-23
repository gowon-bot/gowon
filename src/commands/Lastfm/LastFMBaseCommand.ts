import { Command } from "../../lib/command/Command";
import {
  ParentCommand,
  BaseChildCommand,
} from "../../lib/command/ParentCommand";
import { SpotifyService } from "../../services/Spotify/SpotifyService";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { AlbumCoverService } from "../../services/moderation/AlbumCoverService";
import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { ArgumentsMap } from "../../lib/context/arguments/types";

export abstract class LastFMBaseCommand<
  T extends ArgumentsMap = {}
> extends Command<T> {
  lastFMService = ServiceRegistry.get(LastFMService);
  spotifyService = ServiceRegistry.get(SpotifyService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);
  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  category = "lastfm";
}

export abstract class LastFMBaseParentCommand extends ParentCommand {
  category = "lastfm";
}

export abstract class LastFMBaseChildCommand<
  T extends ArgumentsMap = {}
> extends BaseChildCommand<T> {
  lastFMService = ServiceRegistry.get(LastFMService);
  spotifyService = ServiceRegistry.get(SpotifyService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);

  category = "lastfm";
}
