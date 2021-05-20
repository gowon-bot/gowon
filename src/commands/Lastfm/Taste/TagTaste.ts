import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { numberDisplay } from "../../../helpers";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/BaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LogicError } from "../../../errors";
import { TagsService } from "../../../services/dbservices/tags/TagsService";
import { TasteCommand, tasteMentions } from "./TasteCommand";
import { SimpleScrollingEmbed } from "../../../helpers/Embeds/SimpleScrollingEmbed";

const args = {
  inputs: {
    tag: { index: 0, splitOn: "|" },
    artistAmount: {
      index: 0,
      regex: /(?<=.\|.*)\b[0-9]+\b/g,
      default: 1000,
      number: true,
    },
    username: {
      regex: /(?<=.\|.*)[\w\-\!]+/gi,
      index: 0,
    },
    username2: {
      regex: /(?<=.\|.*)[\w\-\!]+/gi,
      index: 1,
    },
  },
  mentions: tasteMentions,
} as const;

export default class TagTaste extends TasteCommand<typeof args> {
  idSeed = "iz*one yuri";
  aliases = ["tat", "ttaste", "ttb"];
  description = "Shows your taste overlap within a genre with another user";
  usage = [
    "",
    "@user or lfm:username",
    "time period @user",
    "username amount time period",
  ];

  variations: Variation[] = [
    {
      name: "embed",
      variation: "tte",
      description:
        "Uses an embed view instead of a table to display (more mobile friendly)",
    },
  ];

  arguments: Arguments = args;

  validation: Validation = {
    tag: new validators.Required({}),
    artistAmount: {
      validator: new validators.Range({ min: 100, max: 2000 }),
      friendlyName: "artist amount",
    },
  };

  tagService = new TagsService(this.lastFMService, this.logger);

  async run() {
    let artistAmount = this.parsedArguments.artistAmount!,
      tag = this.parsedArguments.tag!;

    let [userOneUsername, userTwoUsername] = await this.getUsernames();

    const [senderPaginator, mentionedPaginator] = this.getPaginators(
      userOneUsername,
      userTwoUsername
    );

    let [senderArtists, mentionedArtists] = await Promise.all([
      senderPaginator.getAllToConcatonable(),
      mentionedPaginator.getAllToConcatonable(),
    ]);

    let senderArtistsFiltered = await this.tagService.filter(
      senderArtists.artists,
      [tag]
    );
    let mentionedArtistsFiltered = await this.tagService.filter(
      mentionedArtists.artists,
      [tag]
    );

    let tasteCalculator = new TasteCalculator(
      senderArtistsFiltered,
      mentionedArtistsFiltered,
      artistAmount
    );

    let taste = tasteCalculator.calculate();

    if (taste.artists.length === 0)
      throw new LogicError(
        `${userOneUsername} and ${userTwoUsername} share no common ${tag} artists!`
      );

    const embedDescription = `Comparing top ${numberDisplay(
      senderArtists.artists.slice(0, artistAmount).length,
      "artist"
    )}, ${numberDisplay(taste.artists.length, `overlapping ${tag} artist`)} (${
      taste.percent
    }% match) found.`;

    let embed = this.newEmbed()
      .setTitle(
        `${tag} taste comparison for ${sanitizeForDiscord(
          userOneUsername
        )} and ${sanitizeForDiscord(userTwoUsername)}`
      )
      .setDescription(embedDescription);

    if (this.variationWasUsed("embed")) {
      this.generateEmbed(taste, embed);
      await this.send(embed);
    } else {
      const scrollingEmbed = new SimpleScrollingEmbed(this.message, embed, {
        items: taste.artists,
        pageSize: 20,
        pageRenderer: (items) => {
          return (
            embedDescription +
            "\n" +
            this.generateTable(userOneUsername, userTwoUsername, items)
          );
        },
      });

      scrollingEmbed.send();
    }
  }
}
