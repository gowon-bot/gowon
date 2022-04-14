import { CommandGroup } from "../../../lib/command/CommandGroup";
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
import { Rating } from "./Commands/Rating";
import { WhoFirstArtist } from "./Commands/WhoFirstArtist";

export default class FriendsParentCommand extends LastFMBaseParentCommand {
  idSeed = "nature lu";

  description = "Manage friends, allowing you to see various stats about them";

  friendlyName = "friends";
  subcategory = "friends";

  prefixes = ["friends", "fr"];
  default = () => new List();

  noPrefixAliases = [
    // add
    "addfriend",
    "addfriends",
    // remove
    "removefriend",
    "removefriends",
  ];

  children: CommandGroup = new CommandGroup(
    [
      Add,
      List,
      Remove,
      RemoveAll,

      // Commands/
      ArtistPlays,
      AlbumPlays,
      TrackPlays,
      Scrobbles,
      Joined,
      Rating,
      WhoFirstArtist,
    ],
    this.id
  );
}
