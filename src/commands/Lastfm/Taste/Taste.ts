import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { numberDisplay } from "../../../helpers";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { Variation } from "../../../lib/command/BaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LogicError } from "../../../errors";
import { TasteCommand, tasteMentions } from "./TasteCommand";
import { SimpleScrollingEmbed } from "../../../helpers/Embeds/SimpleScrollingEmbed";

const args = {
  inputs: {
    artistAmount: {
      index: 0,
      regex: /\b[0-9]+\b/g,
      default: 1000,
      number: true,
    },
    timePeriod: {
      custom: (messageString: string) =>
        generatePeriod(messageString, "overall"),
      index: -1,
    },
    humanReadableTimePeriod: {
      custom: (messageString: string) =>
        generateHumanPeriod(messageString, "overall"),
      index: -1,
    },
    username: {
      regex: /[\w\-\!]+/gi,
      index: 0,
    },
    username2: {
      regex: /[\w\-\!]+/gi,
      index: 1,
    },
  },
  mentions: tasteMentions,
} as const;

export default class Taste extends TasteCommand<typeof args> {
  idSeed = "secret number jinny";
  aliases = ["t", "tb"];
  description = "Shows your taste overlap with another user";
  usage = [
    "",
    "@user or lfm:username",
    "time period @user",
    "username amount time period",
  ];

  variations: Variation[] = [
    {
      name: "embed",
      variation: "te",
      description:
        "Uses an embed view instead of a table to display (more mobile friendly)",
    },
  ];

  arguments: Arguments = args;

  validation: Validation = {
    artistAmount: { validator: new validators.Range({ min: 100, max: 2000 }) },
  };

  async run() {
    let artistAmount = this.parsedArguments.artistAmount!,
      humanReadableTimePeriod = this.parsedArguments.humanReadableTimePeriod!;

    const [userOneUsername, userTwoUsername] = await this.getUsernames();

    const [senderPaginator, mentionedPaginator] = this.getPaginators(
      userOneUsername,
      userTwoUsername
    );

    let [senderArtists, mentionedArtists] = await Promise.all([
      senderPaginator.getAllToConcatonable(),
      mentionedPaginator.getAllToConcatonable(),
    ]);

    let tasteCalculator = new TasteCalculator(
      senderArtists.artists,
      mentionedArtists.artists,
      artistAmount
    );

    let taste = tasteCalculator.calculate();

    if (taste.artists.length === 0)
      throw new LogicError(
        `${userOneUsername} and ${userTwoUsername} share no common artists!`
      );

    const embedDescription =
      userOneUsername === userTwoUsername
        ? "It's 100%, what are you expecting :neutral_face:"
        : `Comparing top ${numberDisplay(
            senderArtists.artists.slice(0, artistAmount).length,
            "artist"
          )}, ${numberDisplay(taste.artists.length, "overlapping artist")} (${
            taste.percent
          }% match) found.`;

    let embed = this.newEmbed()
      .setTitle(
        `Taste comparison for ${sanitizeForDiscord(
          userOneUsername
        )} and ${sanitizeForDiscord(
          userTwoUsername
        )} ${humanReadableTimePeriod}`
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
