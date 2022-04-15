import { flatDeep } from "../../../../helpers";
import { code } from "../../../../helpers/discord";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { componentMap } from "../../../../lib/nowplaying/componentMap";
import { ConfigService } from "../../../../services/dbservices/NowPlayingService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { LastFMBaseChildCommand } from "../../LastFMBaseCommand";

export abstract class NowPlayingConfigChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  parentName = "nowplayingconfig";
  subcategory = "nowplaying";

  configService = ServiceRegistry.get(ConfigService);

  readonly presets = {
    blank: [],
    default: ["artist-plays", "artist-tags", "scrobbles", "artist-crown"],
    verbose: [
      "artist-plays",
      "track-plays",
      "artist-tags",
      "track-tags",
      "artist-crown",
      "loved",
    ],
    all: Object.keys(componentMap),
  };

  protected notAnOptionError(option: string): string {
    return `${code(option)} isn't a valid option. See \`${
      this.prefix
    }npc help\` for a list of available options`;
  }

  protected parseConfig(config: string[]): string[] {
    return flatDeep([...config.map((c) => c.split(/,\s*/))]).filter((c) => !!c);
  }
}

export function preprocessConfig(string: string): string {
  return string.replaceAll(",", "");
}
