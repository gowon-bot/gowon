import { CommandGroup } from "../../../lib/command/CommandGroup";
import { ParentCommand } from "../../../lib/command/ParentCommand";
import { Guild } from "./Guild";
import TimeZone from "./TimeZone";

export default class SettingsParentCommamnd extends ParentCommand {
  idSeed = "kep1er chaehyun";

  friendlyName = "settings";
  prefixes = ["settings"];

  slashCommand = true;

  noPrefixAliases = [
    // Guild
    "guildsettings",
    "serversettings",
    // TimeZone
    "timezone",
    "tz",
    "settz",
    "settimezone",
  ];

  children: CommandGroup = new CommandGroup([Guild, TimeZone], this.id);
}
