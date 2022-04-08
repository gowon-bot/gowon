import { CardsChildCommand } from "./CardsChildCommand";

export class Bank extends CardsChildCommand {
  idSeed = "kep1er mashiro";

  description = "Shows how much money you have";
  archived = true;

  async run() {}
}
