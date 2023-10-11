import { CommandGroup } from "../../../lib/command/CommandGroup";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Start } from "./Me";

export interface JumbledArtist {
  jumbled: string;
  unjumbled: string;
  currenthint: string;
}

export const jumbleRedisKey = "jumbledArtist";

export default class JumbleParentCommand extends LastFMBaseParentCommand {
  idSeed = "clc eunbin";

  friendlyName = "jumble";
  description =
    "Jumbles an artist from your library for you to guess. See `jumble begin` to generate an artist.";
  extraDescription =
    '\nTo make a guess, just send your guess in chat. To get a hint, type "hint" and to quit type "quit"';
  subcategory = "games";

  slashCommand = true;

  prefixes = ["jumble", "j"];
  default = () => new Start();

  children: CommandGroup = new CommandGroup([Start], this.id);
}
