import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class BanArtist extends CrownsChildCommand {
  idSeed = "loona olivia hye";

  description = "Bans an artist from the crowns game";
  usage = "artist";
  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  validation: Validation = {
    artist: new validators.Required({}),
  };

  async run() {
    let artist = (await this.parsedArguments.artist) as string;

    let artistCrownBan = await this.crownsService.artistCrownBan(
      this.guild.id,
      artist
    );

    await this.crownsService.killCrown(
      artistCrownBan.artistName,
      this.guild.id
    );

    await this.reply(
      `succesfully banned ${artistCrownBan.artistName.strong()} from the crowns game.`
    );
  }
}
