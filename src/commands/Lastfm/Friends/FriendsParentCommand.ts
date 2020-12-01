import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Add } from "./Add";
import { List } from "./List";
import { ArtistPlays } from "./Commands/ArtistPlays";
import { Remove } from "./Remove";
import { AlbumPlays } from "./Commands/AlbumPlays";
import { TrackPlays } from "./Commands/TrackPlays";
import { Scrobbles } from "./Commands/Scrobbles";
import { RemoveAll } from "./RemoveAll";
import { Joined } from "./Commands/Joined";

export default class FriendsParentCommand extends LastFMBaseParentCommand {
  description = "Manage friends, allowing you to see various stats about them";

  friendlyName = "friends";
  subcategory = "friends";

  prefixes = ["friends", "fr"];
  default = () => new List();

  children: CommandManager = new CommandManager({
    add: () => new Add(),
    list: () => new List(),
    remove: () => new Remove(),
    removeAll: () => new RemoveAll(),

    // Commands/
    artistplays: () => new ArtistPlays(),
    albumplays: () => new AlbumPlays(),
    trackplays: () => new TrackPlays(),
    scrobbles: () => new Scrobbles(),
    joined: () => new Joined(),
  });
}
