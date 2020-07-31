import { JumbleChildCommand } from "./JumbleChildCommand";
import { Message } from "discord.js";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors";

export class Quit extends JumbleChildCommand {
  description = "Giveup on the current jumble";

  aliases = ["giveup"];

  async run(message: Message) {
    let jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
      message,
      jumbleRedisKey
    );

    if (!jumbledArtist.jumbled)
      throw new LogicError("you haven't jumbled an artist yet!");

    this.redisService.sessionDelete(message, jumbleRedisKey);

    await message.reply(`The artist was ${jumbledArtist.unjumbled.bold()}!`);
  }
}