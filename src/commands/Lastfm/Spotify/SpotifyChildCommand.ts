import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SpotifyBaseChildCommand } from "./SpotifyBaseCommands";

export abstract class SpotifyChildCommand<
  T extends ArgumentsMap = {}
> extends SpotifyBaseChildCommand<T> {
  slashCommand = true;

  parentName = "spotify";
  subcategory = "spotify";
}
