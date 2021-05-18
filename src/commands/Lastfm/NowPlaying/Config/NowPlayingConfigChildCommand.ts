import { Arguments } from "../../../../lib/arguments/arguments";
import { ConfigService } from "../../../../services/dbservices/NowPlayingService";
import { LastFMBaseChildCommand } from "../../LastFMBaseCommand";

export abstract class NowPlayingConfigChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  parentName = "nowplayingconfig";
  subcategory = "nowplaying";

  configService = new ConfigService();

  readonly presets = {
    blank: [],
    default: ["artist-plays", "artist-tags", "scrobbles", "artist-crown"],
    verbose: [
      "artist-plays",
      "track-plays",
      "artist-tags",
      "track-tags",
      "artist-crown",
    ],
  };

  protected notAnOptionError(option: string): string {
    return `${option.code()} isn't a valid option. See \`${
      this.prefix
    }npc help\` for a list of available options`;
  }
}