import { NoAlbumsToMintError } from "../../errors/cards";
import { bold, italic } from "../../helpers/discord";
import { CardsChildCommand } from "./CardsChildCommant";

export class Mint extends CardsChildCommand {
  idSeed = "ive liz";

  description = "Mints a new album card from your top albums";
  aliases = ["roll", "open"];
  usage = [""];

  async run() {
    const { dbUser, requestable } = await this.getMentions({
      senderRequired: true,
    });

    const mintableCards = await this.cardsService.getMintableCards(
      this.ctx,
      dbUser,
      requestable
    );

    if (!mintableCards.length) {
      throw new NoAlbumsToMintError();
    }

    const album = this.cardsService.generateAlbumToMint(mintableCards);
    const card = await this.cardsService.mint(this.ctx, album, dbUser);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Card roll"))
      .setTitle("Rolled card...")
      .setDescription(
        `${bold(card.album)}
by ${italic(card.artist)}`
      )
      .setThumbnail(album.images.get("large") || "");

    await this.send(embed);
  }
}
