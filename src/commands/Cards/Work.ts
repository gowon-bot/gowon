import { Chance } from "chance";
import { add, fromUnixTime } from "date-fns";
import { CantWorkYetError } from "../../errors/cards";
import { ago } from "../../helpers";

import { toInt } from "../../helpers/lastFM";
import { Emoji } from "../../lib/Emoji";
import { displayNumber } from "../../lib/views/displays";
import { RedisService } from "../../services/redis/RedisService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CardsChildCommand } from "./CardsChildCommand";

export class Work extends CardsChildCommand {
  idSeed = "kep1er xiaoting";

  description = "Makes you money (with magic!)";
  usage = [""];

  redisService = ServiceRegistry.get(RedisService);

  customContext = {
    constants: {
      redisOptions: { prefix: "work-timeout" },
    },
  };

  async run() {
    const { dbUser } = await this.getMentions({ senderRequired: true });

    const lastWorkedString = await this.redisService.get(
      this.ctx,
      this.author.id
    );

    const lastWorked = lastWorkedString
      ? fromUnixTime(toInt(lastWorkedString) / 1000)
      : undefined;

    if (lastWorked && add(lastWorked, { hours: 2 }) > new Date()) {
      throw new CantWorkYetError(ago(add(lastWorked, { hours: 1 })));
    }

    const earned = Chance().natural({ min: 10, max: 50 });

    const bankAccount = await this.cardsService.changeBankAccount(
      this.ctx,
      dbUser,
      earned
    );

    await this.redisService.set(
      this.ctx,
      this.author.id,
      `${new Date().getTime()}`
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Work"))
      .setDescription(
        `You earned ${Emoji.fip}${displayNumber(earned)}, you now have ${
          Emoji.fip
        }${displayNumber(bankAccount.amount)}!`
      );

    await this.send(embed);
  }
}
