import { CommandRegistry } from "../../../lib/command/CommandRegistry";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Me } from "./Me";
import { Guess } from "./Guess";
import { Hint } from "./Hint";
import { Quit } from "./Quit";

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
    "Jumbles an artist from your library for you to guess. See jumble me to generate an artist.\n" +
    "To make a guess run `jumble <your guess here>` (or if your guess conflicts with a jumble command, `jumble guess <your guess here>`)";
  subcategory = "games";

  prefixes = ["jumble", "j"];
  default = () => new Guess();

  children: CommandRegistry = new CommandRegistry({
    me: () => new Me(),
    hint: () => new Hint(),
    guess: () => new Guess(),
    giveup: () => new Quit(),
  });
}
