import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Add } from "./Add";
import { List } from "./List";
import { ArtistPlays } from "./Commands/ArtistPlays";
import { Remove } from "./Remove";

export default class FriendsParentCommand extends LastFMBaseParentCommand {
  friendlyName = "friends";

  prefixes = ["friends", "fr", "f"];
  default = () => new List();

  children: CommandManager = new CommandManager({
    add: () => new Add(),
    list: () => new List(),
    remove: () => new Remove(),

    // Commands/
    artistplays: () => new ArtistPlays(),
  });
}
