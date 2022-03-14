import { CommandGroup } from "../../../lib/command/CommandGroup";
import { Help } from "./Help";
import { Like } from "./Like";
import { Privacy } from "./Privacy";
import { Next } from "./RemoteControl/Next";
import { Queue } from "./RemoteControl/Queue";
import { SpotifyBaseParentCommand } from "./SpotifyBaseCommands";
import { Login } from "./Login";

export default class SpotifyParentCommand extends SpotifyBaseParentCommand {
  idSeed = "viviz sinb";

  description = "Allows you to interact with Spotify in various ways!";
  friendlyName = "spotify";

  noPrefixAliases = [
    // Login
    "slogin",
    "spotifylogin",
    // Next
    "next",
    "snext",
    "sskip",
    // Queue
    "queue",
    "q",
    "sq",
    "squeue",
    // Privacy
    "sprivacy",
    "spriv",
    // Like
    "slike",
    "like",
    "unlike",
    "sunlike",
    // Help
    "spotifyhelp",
    "shelp",
  ];

  prefixes = ["spotify", "sp"];
  default = () => new Help();
  customHelp = Help;

  children = new CommandGroup([Help, Like, Login, Next, Privacy, Queue]);
}
