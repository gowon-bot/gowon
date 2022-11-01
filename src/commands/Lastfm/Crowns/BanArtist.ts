import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { CrownsChildCommand } from "./CrownsChildCommand";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { bold } from "../../../helpers/discord";

const args = {
  ...prefabArguments.requiredArtist,
} as const;

export class BanArtist extends CrownsChildCommand<typeof args> {
  idSeed = "loona olivia hye";

  adminCommand = true;

  description = "Bans an artist from the crowns game";
  usage = "artist";
  arguments = args;

  validation: Validation = {
    artist: new validators.RequiredValidator({}),
  };

  async run() {
    let artist = this.parsedArguments.artist;

    let artistCrownBan = await this.crownsService.artistCrownBan(
      this.ctx,
      artist
    );

    await this.crownsService.killCrown(this.ctx, artistCrownBan.artistName);

    await this.oldReply(
      `succesfully banned ${bold(
        artistCrownBan.artistName
      )} from the crowns game.`
    );
  }
}
