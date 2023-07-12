import { CommandGroup } from "../../../lib/command/CommandGroup";
import { SpotifyBaseParentCommand } from "../SpotifyBaseCommands";
import { Add } from "./Add";
import { List } from "./List";
import { SetDefault } from "./SetDefault";
import { Tag } from "./Tag";

export default class SpotifyPlaylistParentCommand extends SpotifyBaseParentCommand {
  idSeed = "pink fantasy seea";

  subcategory = "spotify playlists";
  description = "Allows you to view, tag, and manage your Spotify playlists";
  friendlyName = "spotify playlists";

  noPrefixAliases = [];

  slashCommand = true;

  prefixes = ["splaylists", "spl", "splist"];
  default = () => new List();

  children = new CommandGroup([Add, List, SetDefault, Tag], this.id);
}
