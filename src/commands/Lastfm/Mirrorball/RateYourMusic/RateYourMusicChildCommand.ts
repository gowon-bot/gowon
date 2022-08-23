import { BaseChildCommand } from "../../../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { MirrorballChildCommand } from "../../../../lib/indexing/MirrorballCommands";
import { LastFMArguments } from "../../../../services/LastFM/LastFMArguments";
import { LastFMService } from "../../../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";

export abstract class RateYourMusicChildCommand<
  T extends ArgumentsMap = {}
> extends BaseChildCommand<T> {
  lastFMService = ServiceRegistry.get(LastFMService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}

export abstract class RateYourMusicIndexingChildCommand<
  ResponseT,
  ParamsT,
  T extends ArgumentsMap = {}
> extends MirrorballChildCommand<ResponseT, ParamsT, T> {
  lastFMService = ServiceRegistry.get(LastFMService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}
