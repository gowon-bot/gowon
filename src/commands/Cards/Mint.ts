import { NoAlbumsToMintError } from "../../errors/cards";
import { LogicError } from "../../errors/errors";
import { bold, italic } from "../../helpers/discord";
import { Emoji } from "../../lib/Emoji";
import {
  ConcurrencyService,
  ConcurrentAction,
} from "../../services/ConcurrencyService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CardsChildCommand } from "./CardsChildCommand";

export class Mint extends CardsChildCommand {
  idSeed = "ive liz";

  description = `Mints a new album card from your top albums`;
  aliases = ["roll", "open"];
  usage = [""];

  concurrencyService = ServiceRegistry.get(ConcurrencyService);

  async prerun() {
    if (
      await this.concurrencyService.isUserDoingAction(
        this.author.id,
        ConcurrentAction.Minting
      )
    ) {
      throw new LogicError("Please don't spam this command!");
    }
  }

  async run() {
    this.concurrencyService.registerUser(
      this.ctx,
      ConcurrentAction.Minting,
      this.author.id
    );

    try {
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

      const bankAccount = await this.cardsService.changeBankAccount(
        this.ctx,
        dbUser,
        -25
      );

      const album = this.cardsService.generateAlbumToMint(mintableCards);
      const card = await this.cardsService.mint(this.ctx, album, dbUser);

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Card roll"))
        .setTitle("Rolled card...")
        .setDescription(
          `${bold(card.album)}
  by ${italic(card.artist)}
  
  You now have ${Emoji.fip}${bankAccount.amount}.`
        )
        .setThumbnail(album.images.get("large") || "");

      await this.send(embed);
    } catch (e) {
      this.concurrencyService.unregisterUser(
        this.ctx,
        ConcurrentAction.Minting,
        this.author.id
      );

      throw e;
    }

    this.concurrencyService.unregisterUser(
      this.ctx,
      ConcurrentAction.Minting,
      this.author.id
    );
  }
}
