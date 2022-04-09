import { ClientError } from "./errors";

export class CardNotMintedYetError extends ClientError {
  name = "CardNotMintedYetError";

  constructor(prefix: string) {
    super(
      `That card hasn't been minted yet! You can mint cards with \`${prefix}mint\``
    );
  }
}
