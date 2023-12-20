import { LogicError } from "../../../errors/errors";
import { bold, code, sanitizeForDiscord } from "../../../helpers/discord";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { TasteService } from "../../../services/taste/TasteService";
import { TasteCommand, tasteArgs } from "./TasteCommand";

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
} satisfies ArgumentsMap;

export default class TagTaste extends TasteCommand<typeof args> {
  idSeed = "iz*one yuri";
  aliases = ["tat", "ttaste", "ttb"];
  description = "Shows your taste overlap within a genre with another user";
  usage = ["tag @user or lfm:username", "tag | username amount"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    artistAmount: {
      validator: new validators.RangeValidator({ min: 100, max: 2000 }),
      friendlyName: "artist amount",
    },
  };

  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);
  tasteService = ServiceRegistry.get(TasteService);

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

    const senderArtistsFiltered = await this.lilacArtistsService.filterByTag(
      this.ctx,
      senderArtists.artists,
      [tag]
    );

    const mentionedArtistsFiltered = await this.lilacArtistsService.filterByTag(
      this.ctx,
      mentionedArtists.artists,
      [tag]
    );

    const tasteMatch = this.tasteService.artistTaste(
      senderArtistsFiltered,
      mentionedArtistsFiltered,
      artistAmount
    );

    if (tasteMatch.artists.length === 0)
      throw new LogicError(
        `${code(userOneUsername)} and ${code(
          userTwoUsername
        )} share no common ${bold(tag)} artists!`
      );

    const embedDescription = `Comparing top ${displayNumber(
      senderArtists.artists.slice(0, artistAmount).length,
      "artist"
    )}\n_${displayNumber(
      tasteMatch.artists.length,
      `overlapping ${tag} artist`
    )} ${tasteMatch.percent}% match found (${this.tasteService.compatibility(
      tasteMatch.percent
    )})_`;

    const embed = this.authorEmbed()
      .setHeader("Tag taste")
      .setTitle(
        `${tag} taste comparison for ${sanitizeForDiscord(
          userOneUsername
        )} and ${sanitizeForDiscord(userTwoUsername)}`
      )
      .setDescription(embedDescription);

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: tasteMatch.artists,
      pageSize: 20,
      pageRenderer: (items) => {
        return (
          embedDescription +
          "\n" +
          this.generateTable(userOneUsername, userTwoUsername, items)
        );
      },
    });

    await this.send(scrollingEmbed);
  }
}
