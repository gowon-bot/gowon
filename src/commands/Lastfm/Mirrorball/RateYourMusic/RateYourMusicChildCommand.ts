import { Arguments } from "../../../../lib/arguments/arguments";
import { ChildCommand } from "../../../../lib/command/ParentCommand";
import {
  mirrorballGuilds,
  MirrorballChildCommand,
} from "../../../../lib/indexing/MirrorballCommands";
import { LastFMService } from "../../../../services/LastFM/LastFMService";

export abstract class RateYourMusicChildCommand<
  T extends Arguments = Arguments
> extends ChildCommand<T> {
  lastFMService = new LastFMService(this.logger);

  rollout = {
    guilds: mirrorballGuilds,
  };

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}

export abstract class RateYourMusicIndexingChildCommand<
  ResponseT,
  ParamsT,
  T extends Arguments = Arguments
> extends MirrorballChildCommand<ResponseT, ParamsT, T> {
  lastFMService = new LastFMService(this.logger);

  rollout = {
    guilds: mirrorballGuilds,
  };

  category = "lastfm";
  parentName = "rateyourmusic";
  subcategory = "rateyourmusic";
}
