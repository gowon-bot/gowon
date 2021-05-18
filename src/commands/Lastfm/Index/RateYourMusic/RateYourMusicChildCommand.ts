import { Arguments } from "../../../../lib/arguments/arguments";
import { ChildCommand } from "../../../../lib/command/ParentCommand";
import { IndexingChildCommand } from "../../../../lib/indexing/IndexingCommand";
import { LastFMService } from "../../../../services/LastFM/LastFMService";

export abstract class RateYourMusicChildCommand<
  T extends Arguments = Arguments
> extends ChildCommand<T> {
  lastFMService = new LastFMService(this.logger);

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}

export abstract class RateYourMusicIndexingChildCommand<
  ResponseT,
  ParamsT,
  T extends Arguments = Arguments
> extends IndexingChildCommand<ResponseT, ParamsT, T> {
  lastFMService = new LastFMService(this.logger);

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}
