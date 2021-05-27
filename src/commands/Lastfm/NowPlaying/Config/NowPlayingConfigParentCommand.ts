import { CommandManager } from "../../../../lib/command/CommandManager";
import { indexerGuilds } from "../../../../lib/indexing/IndexingCommand";
import { LastFMBaseParentCommand } from "../../LastFMBaseCommand";
import { Add } from "./Add";
import { Help } from "./Help";
import { Preview } from "./Preview";
import { React } from "./React";
import { Remove } from "./Remove";
import { Set } from "./Set";
import { View } from "./View";

export default class NowPlayingConfigParentCommand extends LastFMBaseParentCommand {
  idSeed = "weeekly soeun";

  subcategory = "config";
  description = "Allows you to change how your nowplaying embeds look";
  friendlyName = "nowplayingconfig";
  customHelp = Help;

  rollout = {
    guilds: indexerGuilds,
  };

  prefixes = ["npc", "nowplayingconfig"];
  default = () => new View();
  canSkipPrefixFor = ["react"];

  children: CommandManager = new CommandManager({
    view: () => new View(),
    set: () => new Set(),
    help: () => new Help(),
    preview: () => new Preview(),
    add: () => new Add(),
    remove: () => new Remove(),
    react: () => new React(),
  });
}
