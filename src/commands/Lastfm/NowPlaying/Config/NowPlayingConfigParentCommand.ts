import { CommandGroup } from "../../../../lib/command/CommandGroup";
import { LastFMBaseParentCommand } from "../../LastFMBaseCommand";
import { Add } from "./Add";
import { Help } from "./Help";
import { Preview } from "./Preview";
import { React } from "./React";
import { Remove } from "./Remove";
import { Set as SetCommand } from "./Set";
import { SetFMMode } from "./SetDefaultFMMode";
import { View } from "./View";

export default class NowPlayingConfigParentCommand extends LastFMBaseParentCommand {
  idSeed = "weeekly soeun";

  subcategory = "config";
  description = "Allows you to change how your nowplaying embeds look";
  friendlyName = "nowplayingconfig";
  customHelp = Help;

  prefixes = ["npc", "nowplayingconfig"];
  default = () => new View();

  slashCommand = true;

  noPrefixAliases = ["react", "reacts", "reactions", "fmmode", "setfmmode"];

  children: CommandGroup = new CommandGroup(
    [View, SetCommand, Help, Preview, Add, Remove, React, SetFMMode],
    this.id
  );
}
