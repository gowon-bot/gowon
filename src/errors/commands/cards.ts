import { ClientError } from "../errors";

export class CardNotMintedYetError extends ClientError {
  name = "CardNotMintedYetError";

  constructor() {
    super(
      `That card wasn't minted during the cards event! Cards can no longer be minted.`
    );
  }
}
