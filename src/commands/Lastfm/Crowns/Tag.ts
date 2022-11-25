import { CrownsChildCommand } from "./CrownsChildCommand";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { StringArrayArgument } from "../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { italic } from "../../../helpers/discord";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

const args = {
  ...standardMentions,
  genres: new StringArrayArgument({
    index: { start: 0 },
    splitOn: "|",
    default: [],
  }),
} satisfies ArgumentsMap;

export class Tag extends CrownsChildCommand<typeof args> {
  idSeed = "dreamnote miso";

  aliases = ["ta", "genre"];
  description = "Lists a user's top crowns by tag";
  usage = ["genre1 | genre2 | genreN", "genre @user"];

  arguments = args;

  slashCommand = true;

  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);

  validation: Validation = {
    genres: new validators.LengthRangeValidator({ min: 1, max: 10 }),
  };

  async run() {
    const genres = this.parsedArguments.genres;

    const { perspective, dbUser } = await this.getMentions();

    const crowns = await this.crownsService.listTopCrowns(
      this.ctx,
      dbUser.discordID,
      -1
    );

    const filteredCrowns = await this.lilacArtistsService.filterByTag(
      this.ctx,
      crowns.map((c) => ({ ...c, name: c.artistName })),
      genres
    );

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Crowns by genre")
    );

    const description =
      italic(
        `${perspective.upper.possessive
        } top crowns for the following genres: ${genres.join(", ")}`
      ) + "\n\n";

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: filteredCrowns,
      pageSize: 15,
      pageRenderer(crowns, { offset }) {
        return (
          description +
          displayNumberedList(
            crowns.map(
              (c) => `${c.artistName} - **${displayNumber(c.plays)}**`
            ),
            offset
          )
        );
      },
      overrides: { itemName: "crown" },
    });

    scrollingEmbed.send();
  }
}
