import { AlbumCard } from "../../database/entity/AlbumCard";
import { bold, italic } from "../../helpers/discord";
import { displayNumberedList } from "../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import { CardsChildCommand } from "./CardsChildCommant";

export class Inventory extends CardsChildCommand {
  idSeed = "ive leeseo";

  description = "Lists all your cards";
  usage = [""];

  async run() {
    const { dbUser } = await this.getMentions({ senderRequired: true });

    const cards = await this.cardsService.inventory(dbUser);

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
