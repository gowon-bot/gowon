import { CommandGroup } from "../../../lib/command/CommandGroup";
import { ParentCommand } from "../../../lib/command/ParentCommand";
import { Guild } from "./Guild";

export default class SettingsParentCommamnd extends ParentCommand {
  idSeed = "kep1er chaehyun";

  friendlyName = "settings";
  prefixes = ["settings"];

  slashCommand = true;

  noPrefixAliases = [
    // Guild
    "guildsettings",
    "serversettings",
  ];

  children: CommandGroup = new CommandGroup([Guild]);
}
