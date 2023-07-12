import { CommandGroup } from "../../lib/command/CommandGroup";
import { ParentCommand } from "../../lib/command/ParentCommand";
import { Submit } from "./Submit";

export default class CommunityPlaylistParentCommand extends ParentCommand {
  idSeed = "newjeans haerin";

  subcategory = "community playlists";
  description =
    "Allows you to view, manage, and interact with community playlists";
  friendlyName = "community playlists";

  noPrefixAliases = ["submit"];

  prefixes = ["playlists", "pl", "list"];
  // default = () => new List();

  children = new CommandGroup([Submit], this.id);
}
