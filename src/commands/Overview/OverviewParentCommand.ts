import { CommandManager } from "../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../Lastfm/LastFMBaseCommand";
import { All } from "./All";

export default class OverviewParentCommand extends LastFMBaseParentCommand {
  friendlyName = "crowns";

  prefixes = ["o"];
  //   default = () => new All();

  children: CommandManager = new CommandManager({
    all: () => new All(),
  });
}
