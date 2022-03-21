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
