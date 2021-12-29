import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TagsService } from "../../../services/mirrorball/services/TagsService";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";

const args = {
  inputs: {
    genres: {
      index: { start: 0 },
      splitOn: "|",
      join: false,
    },
  },
  mentions: standardMentions,
} as const;

export class Tag extends CrownsChildCommand<typeof args> {
  idSeed = "dreamnote miso";

  aliases = ["ta", "genre"];
  description = "Lists a user's top crowns by tag";
  usage = ["genre1 | genre2 | genreN", "genre @user"];

  arguments: Arguments = args;

  tagsService = ServiceRegistry.get(TagsService);

  validation: Validation = {
    genres: new validators.LengthRange({ min: 1, max: 10 }),
  };

  async run() {
    const genres = this.parsedArguments.genres!;

    const { perspective, dbUser } = await this.parseMentions();

    const crowns = await this.crownsService.listTopCrowns(
      this.ctx,
      dbUser.discordID,
      -1
    );

    const filteredCrowns = await this.tagsService.filterArtists(
      this.ctx,
      crowns.map((c) => ({ ...c, name: c.artistName })),
      genres
    );

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Crowns by genre")
    );

    const description =
      `${
        perspective.upper.possessive
      } top crowns for the following genres: ${genres.join(", ")}`.italic() +
      "\n\n";

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
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
      },
      { itemName: "crown" }
    );

    scrollingEmbed.send();
  }
}
