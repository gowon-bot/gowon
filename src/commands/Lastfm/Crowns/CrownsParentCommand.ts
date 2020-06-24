import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Check } from "./Check";

export default class CrownsParentCommand extends LastFMBaseParentCommand {
  // prefix = "crowns "

  children = new CommandManager({
    check: () => new Check(),
  });
}
