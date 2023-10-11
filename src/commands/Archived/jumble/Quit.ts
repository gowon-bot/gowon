import { JumbleChildCommand } from "../../Lastfm/Jumble/JumbleChildCommand";

export class Quit extends JumbleChildCommand {
  idSeed = "clc sorn";

  description = "Giveup on the current jumble";
  aliases = ["giveup", "cancel", "stop"];
  usage = "";

  slashCommand = true;
  archived = true;

  async run() {}
}
