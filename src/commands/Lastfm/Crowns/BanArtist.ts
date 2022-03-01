import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { CrownsChildCommand } from "./CrownsChildCommand";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

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
    artist: new validators.Required({}),
  };

  async run() {
    let artist = this.parsedArguments.artist;

    let artistCrownBan = await this.crownsService.artistCrownBan(
      this.ctx,
      artist
    );

    await this.crownsService.killCrown(this.ctx, artistCrownBan.artistName);

    await this.traditionalReply(
      `succesfully banned ${artistCrownBan.artistName.strong()} from the crowns game.`
    );
  }
}
