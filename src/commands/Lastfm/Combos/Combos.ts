import { NoUserCombosError } from "../../../errors/commands/combo";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumberedList } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { ComboChildCommand } from "./ComboChildCommand";

const args = {
  artist: new StringArgument({
    index: { start: 0 },
    description: "The artist to filter your combos with",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export class Combos extends ComboChildCommand<typeof args> {
  idSeed = "wonder girls yeeun";

  aliases = ["streaks", "cbs"];
  description = "Shows your largest combos";
  subcategory = "library stats";
  usage = ["", "artist name"];

  arguments = args;

  slashCommand = true;
  slashCommandName = "list";

  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);

  async run() {
    let artistName = this.parsedArguments.artist;

    if (artistName) {
      [artistName] = await this.lilacArtistsService.correctArtistNames(
        this.ctx,
        [artistName]
      );
    }

    const { perspective, dbUser } = await this.getMentions();

    const combos = await this.comboService.listCombos(
      this.ctx,
      dbUser,
      artistName
    );

    if (!combos.length) {
      throw new NoUserCombosError(perspective, this.prefix, artistName);
    }

    const embed = this.minimalEmbed().setTitle(
      artistName ? "Artist combos" : "Combos"
    );

    const displayCombo = this.displayCombo.bind(this);

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: combos,
      pageSize: 5,
      pageRenderer(combos, { offset }) {
        return displayNumberedList(combos.map(displayCombo), offset);
      },
      overrides: { itemName: "combo" },
    });

    await this.reply(scrollingEmbed);
  }
}
