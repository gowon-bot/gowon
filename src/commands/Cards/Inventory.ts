import { AlbumCard } from "../../database/entity/cards/AlbumCard";
import { NoCardsError } from "../../errors/commands/cards";
import { bold, italic } from "../../helpers/discord";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { displayNumberedList } from "../../lib/ui/displays";
import { ScrollingListView } from "../../lib/ui/views/ScrollingListView";
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

    if (!cards.length && !artist) {
      throw new NoCardsError();
    } else if (!cards.length && artist) {
      throw new NoCardsError(artist);
    }

    const scrollingEmbed = new ScrollingListView(
      this.ctx,
      this.minimalEmbed().setTitle("Cards inventory"),
      {
        items: cards,
        pageSize: 15,
        pageRenderer(cards: AlbumCard[], { offset }) {
          return displayNumberedList(
            cards.map((c) => `${bold(c.album)} by ${italic(c.artist)}`),
            offset
          );
        },
        overrides: {
          itemName: "card",
        },
      }
    );

    await this.reply(scrollingEmbed);
  }
}
