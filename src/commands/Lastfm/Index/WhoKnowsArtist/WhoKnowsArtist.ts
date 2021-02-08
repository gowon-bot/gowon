import { MessageEmbed } from "discord.js";
import { IndexerError } from "../../../../errors";
import { numberDisplay } from "../../../../helpers";
import { generateLink } from "../../../../helpers/discord";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { IndexingCommand } from "../../../../lib/indexing/IndexingCommand";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import {
  WhoKnowsArtistConnector,
  WhoKnowsArtistParams,
  WhoKnowsArtistResponse,
} from "./WhoKnowsArtist.connector";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export default class WhoKnowsArtist extends IndexingCommand<
  WhoKnowsArtistResponse,
  WhoKnowsArtistParams,
  typeof args
> {
  connector = new WhoKnowsArtistConnector();

  idSeed = "bvndit songhee";

  aliases = ["wk"];

  description = "See who knows an artist";
  secretCommand = true;
  devCommand = true;

  arguments: Arguments = args;

  validation: Validation = {
    artist: new validators.Required({}),
  };

  async run() {
    const { senderUsername } = await this.parseMentions();
    await this.updateAndWait(senderUsername);

    const artistName = this.parsedArguments.artist!;

    const response = await this.query({ artist: artistName });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
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
