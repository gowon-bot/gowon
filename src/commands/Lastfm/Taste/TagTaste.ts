import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { bold, code, sanitizeForDiscord } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LogicError } from "../../../errors/errors";
import { TagsService } from "../../../services/mirrorball/services/TagsService";
import { TasteCommand, tasteArgs } from "./TasteCommand";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  ...tasteArgs,
  tag: new StringArgument({
    index: 0,
    splitOn: "|",
    required: true,
    description: "The tag to filter artists with",
  }),
  artistAmount: new NumberArgument({
    default: 1000,
    description: "The amount of artists to compare",
  }),
  username: new StringArgument({
    regex: /(?<=.\|.*)[\w\-\!]+/gi,
    index: 0,
    description: "The Last.fm username to compare with",
  }),
  username2: new StringArgument({
    regex: /(?<=.\|.*)[\w\-\!]+/gi,
    index: 1,
    description: "The other Last.fm username to compare (defaults to you)",
  }),
} as const;

export default class TagTaste extends TasteCommand<typeof args> {
  idSeed = "iz*one yuri";
  aliases = ["tat", "ttaste", "ttb"];
  description = "Shows your taste overlap within a genre with another user";
  usage = ["tag @user or lfm:username", "tag | username amount"];

  variations: Variation[] = [
    {
      name: "embed",
      variation: "tte",
      description:
        "Uses an embed view instead of a table to display (more mobile friendly)",
    },
  ];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    artistAmount: {
      validator: new validators.Range({ min: 100, max: 2000 }),
      friendlyName: "artist amount",
    },
  };

  tagService = ServiceRegistry.get(TagsService);

  async run() {
    const artistAmount = this.parsedArguments.artistAmount,
      tag = this.parsedArguments.tag;

    const [userOneUsername, userTwoUsername] = await this.getUsernames();

    const [senderPaginator, mentionedPaginator] = this.getPaginators(
      userOneUsername,
      userTwoUsername
    );

    const [senderArtists, mentionedArtists] = await Promise.all([
      senderPaginator.getAllToConcatonable(),
      mentionedPaginator.getAllToConcatonable(),
    ]);

    const senderArtistsFiltered = await this.tagService.filterArtists(
      this.ctx,
      senderArtists.artists,
      [tag]
    );

    const mentionedArtistsFiltered = await this.tagService.filterArtists(
      this.ctx,
      mentionedArtists.artists,
      [tag]
    );

    const tasteCalculator = new TasteCalculator(
      senderArtistsFiltered,
      mentionedArtistsFiltered,
      artistAmount
    );

    const taste = tasteCalculator.calculate();

    if (taste.artists.length === 0)
      throw new LogicError(
        `${code(userOneUsername)} and ${code(
          userTwoUsername
        )} share no common ${bold(tag)} artists!`
      );

    const embedDescription = `Comparing top ${displayNumber(
      senderArtists.artists.slice(0, artistAmount).length,
      "artist"
    )}, ${displayNumber(taste.artists.length, `overlapping ${tag} artist`)} (${
      taste.percent
    }% match) found.`;

    const embed = this.newEmbed()
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
      const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
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
