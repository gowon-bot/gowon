import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { numberDisplay } from "../../../helpers";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/BaseCommand";
import { TopArtists } from "../../../services/LastFM/LastFMService.types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LogicError } from "../../../errors";
import { TagsService } from "../../../services/dbservices/tags/TagsService";
import { TasteCommand, tasteMentions } from "./TasteCommand";

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

    let [senderArtists, mentionedArtists] = (await Promise.all([
      senderPaginator.getAll({ concatTo: "artist" }),
      mentionedPaginator.getAll({ concatTo: "artist" }),
    ])) as [TopArtists, TopArtists];

    let senderArtistsFiltered = await this.tagService.filter(
      senderArtists.artist,
      [tag]
    );
    let mentionedArtistsFiltered = await this.tagService.filter(
      mentionedArtists.artist,
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

    let embed = this.newEmbed()
      .setTitle(
        `${tag} taste comparison for ${sanitizeForDiscord(
          userOneUsername
        )} and ${sanitizeForDiscord(userTwoUsername)}`
      )
      .setDescription(
        `Comparing top ${numberDisplay(
          senderArtists.artist.slice(0, artistAmount).length,
          "artist"
        )}, ${numberDisplay(
          taste.artists.length,
          `overlapping ${tag} artist`
        )} (${taste.percent}% match) found.`
      );

    if (this.variationWasUsed("embed")) {
      this.generateEmbed(taste, embed);
    } else {
      this.generateTable(userOneUsername, userTwoUsername, taste, embed);
    }

    await this.send(embed);
  }
}
