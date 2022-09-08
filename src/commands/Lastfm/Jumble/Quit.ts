import { JumbleChildCommand } from "./JumbleChildCommand";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors/errors";

export class Quit extends JumbleChildCommand {
  idSeed = "clc sorn";

  description = "Giveup on the current jumble";
  aliases = ["giveup", "cancel", "stop"];
  usage = "";

  slashCommand = true;
  archived = true;

  async run() {
    const jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
      jumbleRedisKey
    );

    if (!jumbledArtist.jumbled)
      throw new LogicError("you haven't jumbled an artist yet!");

    this.stopJumble(jumbledArtist.unjumbled, jumbleRedisKey);
  }
}
