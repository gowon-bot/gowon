import { MessageEmbed } from "discord.js";
import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";
import { generateLink } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { Arguments } from "../../../lib/arguments/arguments";
import { BaseCommand } from "../../../lib/command/BaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { IndexingService } from "../../../services/indexing/IndexingService";

export default class WhoKnowsArtist extends BaseCommand {
  idSeed = "bvndit songhee";

  aliases = ["wk"];

  description = "Testing testing 123";
  secretCommand = true;
  devCommand = true;

  indexingService = new IndexingService(this.logger);

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  validation: Validation = {
    artist: new validators.Required({}),
  };

  async run() {
    const artistName = this.parsedArguments.artist as string;

    let response: any;

    try {
      response = await this.indexingService.whoKnowsArtist(artistName);
    } catch (e) {
      if (
        (e.response?.errors || [])[0]?.message?.includes(
          "no rows in result set"
        )
      ) {
        throw new LogicError("that artist couldn't be found!");
      } else throw e;
    }

    const { users, artist } = response.whoKnows;

    const embed = new MessageEmbed()
      .setTitle(`Who knows ${artist.name.strong()}?`)
      .setDescription(
        !artist || users.length === 0
          ? `No one knows this artist`
          : users.map(
              (wk: any, index: number) =>
                `${index + 1}. ${generateLink(
                  wk.user.lastFMUsername,
                  LinkGenerator.userPage(wk.user.lastFMUsername)
                )} - **${numberDisplay(wk.playcount, "**play")}`
            )
      );

    await this.send(embed);
  }
}
