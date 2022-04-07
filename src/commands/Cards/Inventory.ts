import { AlbumCard } from "../../database/entity/cards/AlbumCard";
import { bold, italic } from "../../helpers/discord";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { displayNumberedList } from "../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import { CardsChildCommand } from "./CardsChildCommand";

const args = {
  artist: new StringArgument({ index: { start: 0 } }),
};

export class Inventory extends CardsChildCommand<typeof args> {
  idSeed = "ive leeseo";

  description = "Lists all your cards";
  usage = [""];

  arguments = args;

  async run() {
    const artist = this.parsedArguments.artist;
    const { dbUser } = await this.getMentions({ senderRequired: true });

    const cards = await this.cardsService.inventory(dbUser, artist);

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Cards inventory")
    );

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: cards,
      pageSize: 15,
      pageRenderer(cards: AlbumCard[], { offset }) {
        return displayNumberedList(
          cards.map((c) => `${bold(c.album)} by ${italic(c.artist)}`),
          offset
        );
      },
      overrides: { itemName: "card" },
    });

    scrollingEmbed.send();
  }
}
