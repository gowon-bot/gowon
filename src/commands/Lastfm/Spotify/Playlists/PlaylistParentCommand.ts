import { BetaAccess } from "../../../../lib/command/access/access";
import { CommandGroup } from "../../../../lib/command/CommandGroup";
import { SpotifyBaseParentCommand } from "../SpotifyBaseCommands";
import { Add } from "./Add";
import { List } from "./List";
import { SetDefault } from "./SetDefault";
import { Tag } from "./Tag";

export default class PlaylistParentCommand extends SpotifyBaseParentCommand {
  idSeed = "pink fantasy seea";

  subcategory = "playlists";
  description = "Allows you to view, tag, and manage your Spotify playlists";
  friendlyName = "playlists";

  access = new BetaAccess();

  noPrefixAliases = [];

  prefixes = ["playlists", "pl", "plist"];
  default = () => new List();

  children = new CommandGroup([Add, List, SetDefault, Tag]);
}
