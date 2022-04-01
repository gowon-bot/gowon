import { Emoji } from "../lib/Emoji";
import { ClientError } from "./errors";

export class NoAlbumsToMintError extends ClientError {
  name = "NoAlbumsToMintError";

  constructor() {
    super(
      "Couldn't find any albums that haven't been rolled yet in your library! Try listening to some new albums..."
    );
  }
}

export class CardNotMintedYetError extends ClientError {
  name = "CardNotMintedYetError";

  constructor(prefix: string) {
    super(
      `That card hasn't been minted yet! You can mint cards with \`${prefix}mint\``
    );
  }
}

export class NoMoneyError extends ClientError {
  name = "NoMoneyError";

  constructor(amount: number, increase: number) {
    super(
      `You don't have enough ${Emoji.fip} to do that! (You have ${
        Emoji.fip
      }${amount}, you need at least ${Emoji.fip}${Math.abs(increase)})`
    );
  }
}

export class CantWorkYetError extends ClientError {
  name = "CantWorkYetError";

  constructor(wait: string) {
    super(`You can't work yet! You'll be able to ${wait}.`);
  }
}
