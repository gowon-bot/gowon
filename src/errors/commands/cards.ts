import { bold } from "../../helpers/discord";
import { ClientError } from "../errors";

export class CardNotMintedYetError extends ClientError {
  name = "CardNotMintedYetError";

  constructor() {
    super(
      `That card wasn't minted during the cards event! Cards can no longer be minted.`
    );
  }
}

export class NoCardsError extends ClientError {
  name = "NoCardsError";

  constructor(artist?: string) {
    super(
      artist
        ? `You don't have any cards from ${bold(
            artist
          )}! Cards can no longer be minted.`
        : `You don't have any cards! Cards can no longer be minted.`
    );
  }
}
