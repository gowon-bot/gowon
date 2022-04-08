import { CardsChildCommand } from "./CardsChildCommand";

export class Mint extends CardsChildCommand {
  idSeed = "ive liz";

  description = "Mints a new album card from your top albums";
  aliases = ["roll", "open"];

  archived = true;

  async run() {}
}
