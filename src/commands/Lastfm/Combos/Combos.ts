import { ComboChildCommand } from "./ComboChildCommand";
import { LogicError } from "../../../errors";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { displayNumberedList } from "../../../lib/views/displays";
import { ArtistsService } from "../../../services/mirrorball/services/ArtistsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
} as const;

export class Combos extends ComboChildCommand<typeof args> {
  idSeed = "wonder girls yeeun";

  aliases = ["streaks", "cbs"];
  description = "Shows your largest combos";
  subcategory = "library stats";
  usage = ["", "artist name"];

  arguments = args;

  artistsService = ServiceRegistry.get(ArtistsService);

  async run() {
    let artistName = this.parsedArguments.artist;

    if (artistName) {
      [artistName] = await this.artistsService.correctArtistNames(this.ctx, [
        artistName,
      ]);
    }

    const { perspective, dbUser } = await this.getMentions();

    const combos = await this.comboService.listCombos(
      this.ctx,
      dbUser,
      artistName
    );

    if (!combos.length) {
      throw new LogicError(
        `${perspective.plusToHave} no ${
          artistName ? `${artistName} ` : ""
        }combos saved yet! \`${this.prefix}combo\` saves your combo`
      );
    }

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor(
        `${perspective.upper.possessive.replace(/`/g, "")} top ${
          artistName ? `${artistName} ` : ""
        }combos`
      )
    );

    const displayCombo = this.displayCombo.bind(this);

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: combos,
        pageSize: 5,
        pageRenderer(combos, { offset }) {
          return displayNumberedList(combos.map(displayCombo), offset);
        },
      },
      { itemName: "combo" }
    );

    scrollingEmbed.send();
  }
}
