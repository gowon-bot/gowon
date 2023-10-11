import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { JumbleChildCommand } from "../../Lastfm/Jumble/JumbleChildCommand";

const args = {} satisfies ArgumentsMap;

export class Guess extends JumbleChildCommand<typeof args> {
  idSeed = "clc yeeun";

  archived = true;

  description = "Makes a jumble guess";
  usage = ["artist_guess"];

  arguments = args;

  slashCommand = true;

  async run() {}
}
