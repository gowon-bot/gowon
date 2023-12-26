import { User } from "../../../database/entity/User";
import { Variation } from "../../../lib/command/Command";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCustom extends NowPlayingBaseCommand {
  idSeed = "weeekly jiyoon";

  description =
    "Now playing custom | Displays the now playing or last played track from Last.fm";
  extraDescription =
    ". See `npc help` for details on how to customize your embeds.";
  slashCommandName = "fmx";
  aliases = ["fmx", "npx"];
  variations: Variation[] = [{ name: "badTyping", variation: "fmz" }];
  slashCommand = true;

  async getConfig(senderUser: User): Promise<string[]> {
    return await this.nowPlayingService.getConfigForUser(this.ctx, senderUser!);
  }
}
