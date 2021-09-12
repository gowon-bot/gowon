import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export class BanArtist extends CrownsChildCommand<typeof args> {
  idSeed = "loona olivia hye";

  description = "Bans an artist from the crowns game";
  usage = "artist";
  arguments: Arguments = args;

  validation: Validation = {
    artist: new validators.Required({}),
  };

  async run() {
    let artist = this.parsedArguments.artist!;

    let artistCrownBan = await this.crownsService.artistCrownBan(
      this.ctx,
      this.guild.id,
      artist
    );

    await this.crownsService.killCrown(
      this.ctx,
      artistCrownBan.artistName,
      this.guild.id
    );

    await this.traditionalReply(
      `succesfully banned ${artistCrownBan.artistName.strong()} from the crowns game.`
    );
  }
}
