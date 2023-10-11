import { JumbleChildCommand } from "../../Lastfm/Jumble/JumbleChildCommand";

export class Hint extends JumbleChildCommand {
  idSeed = "clc elkie";

  archived = true;

  description = "Gives you a hint on the current jumble";
  usage = "";

  slashCommand = true;

  async run() {}
}
