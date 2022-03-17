import { JumbleChildCommand } from "./JumbleChildCommand";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors/errors";

export class Quit extends JumbleChildCommand {
  idSeed = "clc sorn";

  description = "Giveup on the current jumble";
  aliases = ["giveup", "cancel"];
  usage = "";

  slashCommand = true;

  async run() {
    let jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
      jumbleRedisKey
    );

    if (!jumbledArtist.jumbled)
      throw new LogicError("you haven't jumbled an artist yet!");

    this.redisService.sessionDelete(this.ctx, jumbleRedisKey);

    await this.oldReply(`The artist was ${jumbledArtist.unjumbled.strong()}!`);
  }
}
