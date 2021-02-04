import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { numberDisplay } from "../../../helpers";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { Variation } from "../../../lib/command/BaseCommand";
import { TopArtists } from "../../../services/LastFM/LastFMService.types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LogicError } from "../../../errors";
import { TasteCommand, tasteMentions } from "./TasteCommand";
import { RunAs } from "../../../lib/command/RunAs";

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
      variationString: "te",
      description:
        "Uses an embed view instead of a table to display (more mobile friendly)",
    },
  ];

  arguments: Arguments = args;

  validation: Validation = {
    artistAmount: { validator: new validators.Range({ min: 100, max: 2000 }) },
  };

  async run(_: Message, runAs: RunAs) {
    let artistAmount = this.parsedArguments.artistAmount!,
      humanReadableTimePeriod = this.parsedArguments.humanReadableTimePeriod!;

    const [userOneUsername, userTwoUsername] = await this.getUsernames();

    const [senderPaginator, mentionedPaginator] = this.getPaginators(
      userOneUsername,
      userTwoUsername
    );

    let [senderArtists, mentionedArtists] = (await Promise.all([
      senderPaginator.getAll({ concatTo: "artist" }),
      mentionedPaginator.getAll({ concatTo: "artist" }),
    ])) as [TopArtists, TopArtists];

    let tasteCalculator = new TasteCalculator(
      senderArtists.artist,
      mentionedArtists.artist,
      artistAmount
    );

    let taste = tasteCalculator.calculate();

    if (taste.artists.length === 0)
      throw new LogicError(
        `${userOneUsername} and ${userTwoUsername} share no common artists!`
      );

    let embed = this.newEmbed()
      .setTitle(
        `Taste comparison for ${sanitizeForDiscord(
          userOneUsername
        )} and ${sanitizeForDiscord(
          userTwoUsername
        )} ${humanReadableTimePeriod}`
      )
      .setDescription(
        `Comparing top ${numberDisplay(
          senderArtists.artist.slice(0, artistAmount).length,
          "artist"
        )}, ${numberDisplay(taste.artists.length, "overlapping artist")} (${
          taste.percent
        }% match) found.`
      );

    if (runAs.variationWasUsed("te")) {
      this.generateEmbed(taste, embed);
    } else {
      this.generateTable(userOneUsername, userTwoUsername, taste, embed);
    }

    await this.send(embed);
  }
}
