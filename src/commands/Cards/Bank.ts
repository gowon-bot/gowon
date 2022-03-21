import { displayNumber } from "../../lib/views/displays";
import { CardsChildCommand } from "./CardsChildCommant";

export class Bank extends CardsChildCommand {
  idSeed = "kep1er mashiro";

  description = "Shows how much money you have";
  usage = [""];

  async run() {
    const { dbUser } = await this.getMentions({ senderRequired: true });

    const bankAccount = await this.cardsService.getBankAccount(
      this.ctx,
      dbUser
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Bank account"))
      .setDescription(`You have 🪙${displayNumber(bankAccount.amount)}.`);

    await this.send(embed);
  }
}
