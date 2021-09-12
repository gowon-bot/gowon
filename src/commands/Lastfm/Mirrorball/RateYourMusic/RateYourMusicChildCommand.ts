import { Arguments } from "../../../../lib/arguments/arguments";
import { ChildCommand } from "../../../../lib/command/ParentCommand";
import { MirrorballChildCommand } from "../../../../lib/indexing/MirrorballCommands";
import { LastFMService } from "../../../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";

export abstract class RateYourMusicChildCommand<
  T extends Arguments = Arguments
> extends ChildCommand<T> {
  lastFMService = ServiceRegistry.get(LastFMService);

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}

export abstract class RateYourMusicIndexingChildCommand<
  ResponseT,
  ParamsT,
  T extends Arguments = Arguments
> extends MirrorballChildCommand<ResponseT, ParamsT, T> {
  lastFMService = ServiceRegistry.get(LastFMService);

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}
